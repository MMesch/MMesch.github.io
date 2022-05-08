module Util where

import Prelude
import Effect.Class (liftEffect)
import Effect.Aff (attempt, Aff)
import Types (Post)
import Milkis as M
import Milkis.Impl.Window (windowFetch)
import Control.Monad.Except (runExcept)
import Control.Monad.Except.Trans (withExceptT, except, ExceptT)
import Data.Either (Either(Right, Left), hush, note)
import Foreign (renderForeignError)
import Data.Bifunctor (bimap)
import Data.Traversable (sequence)
import Data.Foldable (foldMap)
import Data.Argonaut.Decode.Class (decodeJson, class DecodeJson)
import Data.Argonaut.Decode.Error (printJsonDecodeError)
import Data.YAML.Foreign.Decode (parseYAMLToJson)
import Data.String (split, Pattern(Pattern), replace, Replacement(Replacement))
import Data.String.Regex (regex, match, replace')
import Data.Identity (Identity)
import Data.String.Regex.Flags (noFlags, global, multiline)
import Data.Array.NonEmpty ((!!))
import Data.Array (head)
import Data.Maybe (Maybe(Just, Nothing), fromMaybe)

fixupHtml :: String -> Maybe String
fixupHtml rawHtml = do
  mspace <- hush $ regex "<(mspace.*)/>" global
  svgpath <- hush $ regex "<(path[\\s\\S]*?)\\/>" (global <> multiline)
  let
    mspaceReplacer _ groups =
      "<"
        <> (fromMaybe "mspace width=0" (join $ head groups))
        <> "></mspace>"

    pathReplacer _ groups =
        "<"
            <> (fromMaybe "path" (join $ head groups))
            <> "></path>"

    fixedHtml1 = replace' mspace mspaceReplacer rawHtml

    fixedHtml2 = replace' svgpath pathReplacer fixedHtml1
  pure fixedHtml2

fetchFile :: String -> Aff (Either String String)
fetchFile url = do
  _response <- attempt $ M.fetch windowFetch (M.URL url) M.defaultFetchOptions
  (sequence $ bimap show M.text _response)

fetchList :: String -> Aff (Either String (Array String))
fetchList url = do
  content <- fetchFile url
  pure $ split (Pattern "\n") <$> content

fetchPost :: String -> Aff (Either String Post)
fetchPost url = do
  contentEither <- fetchFile url
  compiledEither <- fetchFile (replace (Pattern ".md") (Replacement ".html") url)
  pure
    $ do
        content <- contentEither
        { header, body } <- note "error in markdown extractions" $ extractMarkdown content
        (post :: Post) <- runExcept $ parseYaml header
        pure
          $ post
              { content = Just body
              , path = Just url
              , compiled = hush compiledEither >>= fixupHtml
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

fetchYaml :: forall a. DecodeJson a => String -> Aff (Either String a)
fetchYaml url = do -- Aff
  yamlEither <- fetchFile url
  pure
    $ do -- Either
        yaml <- yamlEither
        runExcept (parseYaml yaml)

parseYaml :: forall a. DecodeJson a => String -> ExceptT String Identity a
parseYaml content = do -- this is an Either Monad
  json <- withExceptT foreignListError $ parseYAMLToJson content
  withExceptT printJsonDecodeError (except (decodeJson json))
  where
  foreignListError x = foldMap (\err -> renderForeignError err) x
