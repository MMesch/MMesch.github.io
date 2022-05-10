module Routes where

import Prelude hiding ((/))
import Types (Route, Page(Main), Query(Navigate))
import Effect.Class (class MonadEffect)
import Effect (Effect)
import Effect.Aff (launchAff_, Aff)
import Data.Maybe (Maybe(Just), fromMaybe)
import Data.Either (hush)
import Data.String (stripPrefix, stripSuffix, Pattern(Pattern))
import Halogen as H
import Halogen.Query as HQ
import Routing.Hash as RH
import Routing.PushState (matchesWith, PushStateInterface)
import Foreign (unsafeToForeign)
import Routing.Duplex
  ( RouteDuplex'
  , parse
  , path
  , string
  , segment
  , root
  , optional
  , print
  )
import Routing.Duplex.Generic (sum, noArgs)
import Routing.Duplex.Generic.Syntax ((/))

{-
these are the actual codecs that map a string to a datatype and inversely.
With the routing library, codecs for different data types can be composed.
-}
routeCodec :: RouteDuplex' Route
routeCodec = root $ optional pageCodec

pageCodec :: RouteDuplex' Page
pageCodec =
  sum
    { "Loading": "loading" / noArgs
    , "Main": noArgs
    , "BlogList": "blog" / noArgs
    , "Blog": path "blog" (string segment)
    }

{-
this function takes a Route datatype, maps it to a string via the routeCodec
and then sets the url hash accordingly
-}
setUrlHash :: forall m. MonadEffect m => String -> m Unit
setUrlHash = H.liftEffect <<< RH.setHash <<< addBang

setUrl :: forall m. MonadEffect m => PushStateInterface -> Route -> m Unit
setUrl nav = H.liftEffect <<< nav.pushState (unsafeToForeign {}) <<< print routeCodec

{-
this function gets the browser hash on initialization and then
navigates to the correct spot with the Main page as default option.
-}
validateUrlHash :: forall m. MonadEffect m => m Unit
validateUrlHash = do
  initialRoute <- hush <<< (parse routeCodec) <$> H.liftEffect RH.getHash
  setUrlHash $ print routeCodec $ fromMaybe (Just Main) initialRoute

validateUrl :: forall m. MonadEffect m => PushStateInterface -> m Unit
validateUrl nav = do
  { path } <- H.liftEffect nav.locationState
  let
    initialRoute = hush $ (parse routeCodec) (stripSlash path)
  setUrl nav $ fromMaybe (Just Main) initialRoute

{-
Runs a callback on every hash change using a given custom parser to extract a
route from the hash.
-}
listenForUrlChanges ::
  forall a b.
  PushStateInterface ->
  { query :: Query Unit -> Aff a | b } ->
  Effect (Effect Unit)
listenForUrlChanges nav halogenIO =
  nav
    # matchesWith (parse routeCodec) \old new -> do
        when (old /= Just new) do
          launchAff_ $ halogenIO.query $ HQ.mkTell $ Navigate new

listenForUrlHashChanges ::
  forall a b.
  { query :: Query Unit -> Aff a | b } ->
  Effect (Effect Unit)
listenForUrlHashChanges halogenIO =
  RH.matchesWith (stripBang >>> parse routeCodec) \old new -> do
    when (old /= Just new) do
      launchAff_ $ halogenIO.query $ HQ.mkTell $ Navigate new

addBang :: String -> String
addBang = (<>) "!"

stripSlash :: String -> String
stripSlash str = fromMaybe str $ stripSuffix (Pattern "/") str

stripBang :: String -> String
stripBang str = fromMaybe str $ stripPrefix (Pattern "!") str
