module Types where

import Prelude
import Data.Maybe (Maybe)
import Data.Generic.Rep (class Generic)
import Data.Map (Map)

{-
page hierarchy
-}
data Page
  = Main
  | BlogList
  | Blog String

-- this is required to automatically match these Main, Blog, About with a
-- text route later
derive instance genericPage :: Generic Page _

-- this is required to check whether a new page corresponds to an old one.
derive instance eqPage :: Eq Page

{- the route type is a simple wrapper around page is necessary because the url
-- could match with no page
-}
type Route
  = Maybe Page

{-
an Action is a datatype that describes
this could contain e.g. switching language instead of page, or
changing the window resolution. Actions are _internal_ to a component and
can't be directly triggered from the outside (they can be triggered indirectly
thought.
-}
data Action
  = SwitchPage Page
  | Initialize

{-
Query type. A query has one type parameter that defines queries that can be
send to a component. The component can then trigger some action without
returning a value (tell-style), or return a value (request-style).
-}
data Query a
  = Navigate Route a

{-
Every component also has its own state. In our case this very simple and just
the page the user is looking at.
-}
type State
  = { page :: Page
    , posts :: Posts
    , cv :: Maybe CV
    }

type CV
  = { summary :: String
    , what :: String
    , domains :: String
    , stack :: String
    , experience :: Array Experience
    , education :: Array Education
    }

type Experience
  = { employer :: String
    , role :: String
    , years :: String
    , description :: String
    }

type Education
  = { qualification :: String
    , name :: String
    , institution :: String
    }

type Post
  = { title :: Maybe String
    , id :: Maybe String
    , path :: Maybe String
    , date :: Maybe String
    , thumb :: Maybe String
    , description :: Maybe String
    , content :: Maybe String
    , compiled :: Maybe String
    , external :: Maybe String
    , thumbnail :: Maybe String
    }

type Posts
  = Map String Post
