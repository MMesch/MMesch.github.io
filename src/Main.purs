module Main where

import Prelude
import Control.Parallel (parSequence)
import Data.Maybe (Maybe(..), fromMaybe)
import Effect (Effect)
import Effect.Aff.Class (class MonadAff)
import Effect.Class (class MonadEffect)
import Effect.Class.Console (log)
import Halogen as H
import Halogen.Aff as HA
import Halogen.VDom.Driver (runUI)
import Pages (blogList, mainPage, blogPage)
import Debug (traceM)
import Routes (listenForUrlHashChanges, validateUrlHash, setUrlHash)
import Types
  ( Page(Main, Blog, BlogList)
  , Action(SwitchPage, Initialize)
  , State
  , Query(Navigate)
  )
import Util (fetchList, fetchPost, fetchFile)
import Data.Map (lookup, fromFoldable)
import Data.Tuple (Tuple(Tuple))
import Data.Array (catMaybes)
import Data.Options ((:=))
import MarkdownIt
  ( Preset(CommonMark, Default)
  , highlight
  , html
  , typographer
  , newMarkdownIt
  )
import Highlight as HL

{-
This is a minimal purescript example that sets up a website.

This gets the body element and injects the halogen component
it also listens for url changes and triggers a Navigate action
to switch pages with a halogen query that is sent to the component.
-}
main :: Effect Unit
main =
  HA.runHalogenAff do
    HA.awaitLoad
    body <- HA.awaitBody
    halogenIO <- runUI component unit body
    canceller <- H.liftEffect $ listenForUrlHashChanges halogenIO
    pure unit

{-
Main component. This component is the purescript javascript code.
-}
component :: forall i m. MonadEffect m => MonadAff m => H.Component Query i Void m
component =
  H.mkComponent
    { initialState
    , render
    , eval:
        H.mkEval
          $ H.defaultEval
              { handleQuery = handleQuery
              , handleAction = handleAction
              , initialize = Just Initialize
              }
    }
  where
  {- initial state -}
  initialState _ =
    { page: Main
    , posts: fromFoldable []
    , markdownIt: Nothing
    }

  {-
  handleQuery is more interesting
  -}
  handleQuery :: forall c a. Query a -> H.HalogenM State Action c Void m (Maybe a)
  handleQuery = case _ of
    Navigate (destPage) a -> do
      { page } <- H.get
      when (Just page /= destPage) do
        H.modify_ \state ->
          state
            { page = fromMaybe Main destPage }
      pure $ Just a

  handleAction :: forall c. Action -> H.HalogenM State Action c Void m Unit
  handleAction = case _ of
    SwitchPage page -> do
      state <- H.get
      setUrlHash (Just page)
    Initialize -> do
      validateUrlHash
      rawList <- H.liftAff $ fetchFile "./blog/posts.dat"
      postListEither <- H.liftAff $ fetchList "./blog/posts.dat"
      markdownIt <-
        H.liftEffect
          $ newMarkdownIt Default
          $ (highlight := HL.highlight)
          <> (typographer := true)
          <> (html := true)
      case postListEither of
        Nothing -> H.liftAff $ log "err"
        Just postList -> do
          let
            paths = ((<>) "./blog/") <$> postList
          arr <- H.liftAff $ parSequence $ fetchPost <$> paths
          let
            postMap = fromFoldable $ toTuple <$> catMaybes arr
          H.modify_
            ( \state ->
                state
                  { posts = postMap
                  , markdownIt = Just markdownIt
                  }
            )
    where
    toTuple el = Tuple (fromMaybe "default" el.id) el

  render :: forall c. State -> H.ComponentHTML Action c m
  render state = case state.page of
    Main -> mainPage
    BlogList -> blogList state
    Blog path ->
      fromMaybe mainPage
        $ do
            post <- (lookup path state.posts)
            markdownIt <- state.markdownIt
            pure $ blogPage markdownIt post
