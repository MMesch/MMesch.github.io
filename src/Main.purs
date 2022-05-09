module Main where

import Prelude
import Data.Array (filter, zip)
import Control.Monad.Reader.Trans (class MonadAsk, ReaderT, runReaderT, asks)
import Type.Equality (class TypeEquals, from)
import Control.Parallel (parSequence)
import Data.Maybe (Maybe(..), fromMaybe)
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Aff.Class (class MonadAff)
import Effect.Class (class MonadEffect)
import Effect.Class.Console (log)
import Halogen as H
import Halogen.Aff as HA
import Halogen.VDom.Driver (runUI)
import Pages (blogList, mainPage, blogPage)
import Routes (listenForUrlChanges, routeCodec, setUrl, validateUrl)
import Routing.Duplex as RD
import Routing.PushState (makeInterface, PushStateInterface)
import Web.Event.Event as Event
import Types
  ( Page(Main, Blog, BlogList)
  , Action(SwitchPage, Initialize)
  , State
  , Query(Navigate)
  , Route
  , CV
  )
import Util (fetchList, fetchPost, fetchYaml)
import Data.Map (lookup, fromFoldable)
import Data.Either (Either(Left, Right), hush, isLeft, isRight, fromLeft)
import Data.Tuple (Tuple(Tuple), fst, snd)
import Data.Array (catMaybes)
import Data.Options ((:=))
import Foreign (unsafeToForeign)
import Debug

{-
This is a minimal purescript example that sets up a website.

This gets the body element and injects the halogen component
it also listens for url changes and triggers a Navigate action
to switch pages with a halogen query that is sent to the component.
-}
main :: Effect Unit
main =
  HA.runHalogenAff do
    nav <- H.liftEffect makeInterface
    let
      environment :: Env
      environment = { nav }

      rootcomponent = H.hoist (runAppM environment) component
    HA.awaitLoad
    body <- HA.awaitBody
    halogenIO <- runUI rootcomponent unit body
    canceller <- H.liftEffect $ (listenForUrlChanges nav) halogenIO
    pure unit

type Env
  = { nav :: PushStateInterface
    }

newtype AppM a
  = AppM (ReaderT Env Aff a)

derive newtype instance functorAppM :: Functor AppM

derive newtype instance applyAppM :: Apply AppM

derive newtype instance applicativeAppM :: Applicative AppM

derive newtype instance bindAppM :: Bind AppM

derive newtype instance monadAppM :: Monad AppM

derive newtype instance monadEffectAppM :: MonadEffect AppM

derive newtype instance monadAffAppM :: MonadAff AppM

instance monadAskAppM :: TypeEquals e Env => MonadAsk e AppM where
  ask = AppM $ asks from

class Monad m <= Navigate m where
  navigate :: Route -> m Unit

instance navigateHalogenM :: Navigate m => Navigate (H.HalogenM state action slots output m) where
  navigate = H.lift <<< navigate

instance navigateAppMPush :: Navigate AppM where
  navigate route = do
    nav <- asks _.nav
    setUrl nav route

runAppM :: Env -> AppM ~> Aff
runAppM env (AppM m) = runReaderT m env

{-
Main component. This component is the purescript javascript code.
-}
component :: forall i. H.Component Query i Void AppM
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
    , cv: Nothing
    }

  {-
  handleQuery is more interesting
  -}
  handleQuery :: forall c a. Query a -> H.HalogenM State Action c Void AppM (Maybe a)
  handleQuery = case _ of
    Navigate (destPage) a -> do
      { page } <- H.get
      when (Just page /= destPage) do
        H.modify_ \state ->
          state
            { page = fromMaybe Main destPage }
      pure $ Just a

  handleAction :: forall c. Action -> H.HalogenM State Action c Void AppM Unit
  handleAction = case _ of
    SwitchPage page ev -> do
      H.liftEffect $ Event.preventDefault ev 
      state <- H.get
      navigate (Just page)
    Initialize -> do -- HalogenM
      nav <- asks _.nav
      validateUrl nav
      cvData :: Either String CV <- H.liftAff $ fetchYaml "/assets/cv.yaml"
      H.modify_ (\state -> state { cv = hush cvData })
      postListEither <- H.liftAff $ fetchList "/blog/posts.dat"
      case postListEither of
        Left err -> H.liftAff $ log err
        Right postList -> do
          let
            paths = ((<>) "/blog/") <$> postList
          arr <- H.liftAff $ parSequence $ fetchPost <$> paths
          let
            postMap = fromFoldable $ toTuple <$> catMaybes (hush <$> arr)

            failed = filter (\(Tuple el path) -> isLeft el) $ zip arr paths

            printFailed x = log $ "failed path: " <> show (snd x) <> " - " <> fromLeft "unknown error" (fst x)
          _ <- parSequence $ printFailed <$> failed
          H.modify_ ( \state -> state { posts = postMap } )
    where
    toTuple el = Tuple (fromMaybe "default" el.id) el

  render :: forall c. State -> H.ComponentHTML Action c AppM
  render state = case state.page of
    Main -> mainPage state.cv
    BlogList -> blogList state
    Blog path ->
      fromMaybe (mainPage state.cv)
        $ do
            post <- (lookup path state.posts)
            pure $ blogPage post
