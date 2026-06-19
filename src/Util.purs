module Util where

import Prelude
import Effect.Class (liftEffect)
import Effect.Aff (attempt, Aff)
import Types (Post)
import Markdown (render)
import Control.Monad.Except (runExcept)
import Control.Monad.Except.Trans (withExceptT, except, ExceptT)
import Data.Either (Either(Right, Left), hush, note)
import Foreign (renderForeignError)
import Data.Bifunctor (bimap)
import Data.Foldable (foldMap)
import Data.Argonaut.Decode.Class (decodeJson, class DecodeJson)
import Data.Argonaut.Decode.Error (printJsonDecodeError)
import Data.YAML.Foreign.Decode (parseYAMLToJson)
import Data.String (split, Pattern(Pattern))
import Data.Identity (Identity)
import Data.String.Regex (regex, match)
import Data.String.Regex.Flags (noFlags)
import Data.Array.NonEmpty ((!!))
import Data.Maybe (Maybe(Just, Nothing), fromMaybe)

foreign import fetchNoCache :: String -> Aff String

fetchFile :: String -> Aff (Either String String)
fetchFile url = do
  content <- attempt $ fetchNoCache url
  pure $ bimap show identity content

fetchList :: String -> Aff (Either String (Array String))
fetchList url = do
  content <- fetchFile url
  pure $ split (Pattern "\n") <$> content

fetchPost :: String -> Aff (Either String Post)
fetchPost url = do
  contentEither <- fetchFile url
  case contentEither of
    Left err -> pure $ Left err
    Right content -> case extractMarkdown content of
      Nothing -> pure $ Left "error in markdown extractions"
      Just { header, body } -> case runExcept ((parseYaml header) :: ExceptT String Identity Post) of
        Left err -> pure $ Left err
        Right post' -> do
          html <- liftEffect $ render body
          pure $ Right $ post'
            { content = Just html
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

fetchYaml :: forall a. DecodeJson a => String -> Aff (Either String a)
fetchYaml url = do
  yamlEither <- fetchFile url
  pure
    $ do
        yaml <- yamlEither
        runExcept (parseYaml yaml)

parseYaml :: forall a. DecodeJson a => String -> ExceptT String Identity a
parseYaml content = do
  json <- withExceptT foreignListError $ parseYAMLToJson content
  withExceptT printJsonDecodeError (except (decodeJson json))
  where
  foreignListError x = foldMap (\err -> renderForeignError err) x
