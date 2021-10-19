module Util where

import Prelude
import Effect.Class (liftEffect)
import Effect.Aff (attempt, Aff)
import Types (Post)
import Milkis as M
import Milkis.Impl.Window (windowFetch)
import Control.Monad.Except (runExcept)
import Data.Either (Either(Right, Left), hush)
import Data.Bifunctor (bimap, lmap)
import Data.Traversable (sequence)
import Data.Argonaut.Decode.Class (decodeJson, class DecodeJson)
import Data.YAML.Foreign.Decode (parseYAMLToJson)
import Data.String (split, Pattern(Pattern))
import Data.String.Regex (regex, match)
import Data.String.Regex.Flags (noFlags)
import Data.Array.NonEmpty ((!!))
import Data.Maybe (Maybe(Just, Nothing), maybe)
import Debug (spy, traceM)

fetchFile :: String -> Aff (Maybe String)
fetchFile url = do
  _response <- attempt $ M.fetch windowFetch (M.URL url) M.defaultFetchOptions
  hush <$> (sequence $ bimap show M.text _response)

fetchList :: String -> Aff (Maybe (Array String))
fetchList url = do
  content <- fetchFile url
  pure $ split (Pattern "\n") <$> content

fetchPost :: String -> Aff (Maybe Post)
fetchPost url = do
  contentMaybe <- fetchFile url
  pure
    $ do
        content <- contentMaybe
        { header, body } <- extractMarkdown content
        (post :: Post) <- parseYaml header
        pure
          $ post
              { content = Just body
              , path = Just url
              , date =
                do
                  dateExpr <- hush $ regex ".*/(\\d+-\\d+-\\d+)-.*" noFlags
                  arr <- match dateExpr url
                  join $ arr !! 1
              , id =
                do
                  idExpr <- hush $ regex ".*/(.+)\\.md" noFlags
                  arr <- match idExpr url
                  join $ arr !! 1
              }

extractMarkdown :: String -> Maybe { header :: String, body :: String }
extractMarkdown markdown = do
  expr <- hush $ regex "\\s*---([\\s\\S]*?)---\\s*([\\s\\S]*)" noFlags
  arr <- match expr markdown
  firstGroup <- arr !! 1
  header <- firstGroup
  secondGroup <- arr !! 2
  body <- secondGroup
  pure { header: header, body: body }

fetchYaml :: forall a. DecodeJson a => String -> Aff (Maybe a)
fetchYaml url = do
  yamlEither <- fetchFile url
  pure $ yamlEither >>= parseYaml

parseYaml :: forall a. DecodeJson a => String -> Maybe a
parseYaml content = do -- this is an Either Monad
  json <- hush $ runExcept $ parseYAMLToJson content
  hush $ decodeJson json
