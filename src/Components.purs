module Components where

import Prelude
import Types (Action(SwitchPage), Page(..), Posts, Post)
import Data.List (toUnfoldable)
import Data.Array (reverse)
import Data.Maybe (fromMaybe)
import Halogen.HTML as HH
import Halogen.HTML.Properties as HP
import Halogen.HTML.Events as HE
import Data.Map (values)

-- This is a little helper to save some space
cn :: forall t5 t6. String -> HH.IProp ( class :: String | t6 ) t5
cn = HP.class_ <<< HH.ClassName

{- nav bar component -}
navBarButton ::
  forall i.
  { action :: Action, content :: String } ->
  HH.HTML i Action
navBarButton { action, content } =
  HH.a
    [ HE.onClick \_ -> action
    , cn "block hover:cursor-pointer m-3"
    ]
    [ HH.text content ]

navBarButtonGroup ::
  forall i a.
  { elements :: Array (HH.HTML i a) } -> HH.HTML i a
navBarButtonGroup { elements } = HH.div [ cn "flex flex-row font-bold text-3xl" ] elements

{- writing pages -}
navBar :: forall i. HH.HTML i Action
navBar =
  HH.div [ cn "flex flex-row justify-between" ]
    [ navBarButtonGroup
        { elements:
            []
        }
    , navBarButtonGroup
        { elements:
            [ navBarButton { action: SwitchPage Main, content: "home" }
            , navBarButton { action: SwitchPage BlogList, content: "blog" }
            ]
        }
    ]

container :: forall i a. Array (HH.HTML i a) -> HH.HTML i a
container content = HH.div [ cn "w-full max-w-colwidth block mx-auto" ] content

list :: forall i. Posts -> HH.HTML i Action
list posts =
  HH.div [ cn "bg-white block p-6 flex flex-col" ]
    $ reverse
    (toUnfoldable (values posts))
    <#> listCard

listCard :: forall i. Post -> HH.HTML i Action
listCard post =
  HH.a
    [ HE.onClick \_ -> SwitchPage (Blog $ fromMaybe "default" post.id)
    , cn "hover:cursor-pointer block p-5 m-2 border-2 rounded border-black border-opacity-30"
    ]
    [ HH.div [ cn "block text-lg" ] [ HH.text $ fromMaybe "no title" post.title ]
    , HH.div [ cn "block" ] [ HH.text $ fromMaybe "no date" post.date ]
    ]

layout1 :: forall i. HH.HTML i Action
layout1 =
  HH.div [ cn "bg-palered" ]
    [ navBar
    , HH.text "Hey there"
    ]
