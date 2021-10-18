module Pages where

import Prelude
import Types (State, Action(SwitchPage), Page(..), Posts, Post)
import Data.Maybe (fromMaybe)
import MarkdownIt (MarkdownIt)
import Halogen.HTML as HH
import Halogen.HTML.Properties as HP
import Halogen.HTML.Events as HE
import MarkdownIt.Renderer.Halogen (render_)
import Data.List (toUnfoldable)
import Data.Array (reverse)
import Data.Maybe (fromMaybe, Maybe(Just, Nothing), maybe)
import Data.Map (values)
import Debug (spy)

blogList :: forall i. State -> HH.HTML i Action
blogList state =
  HH.div [ cn "block" ]
    $ [ navBar
      , container [ list $ state.posts ]
      ]

mainPage :: forall i. HH.HTML i Action
mainPage = HH.div [ cn "block" ] [ navBar ]

blogPage :: forall i. MarkdownIt -> Post -> HH.HTML i Action
blogPage markdownIt post =
  let
    markdown = fromMaybe "" post.content

    rendered = render_ markdownIt markdown

    title = fromMaybe "no title" post.title

    date = fromMaybe "no date" post.date
  in
    HH.div [ cn "block" ]
      [ navBar
      , HH.div [ cn "markdown max-w-colwidth border-t-2 lg:border-0 border-gray mx-auto mt-6 pt-6 pb-12" ]
          [ HH.h1 [] [ HH.text title ]
          , HH.div [ cn "mb-6" ] [ HH.text date ]
          , rendered
          ]
      ]

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
    , cn "block hover:cursor-pointer my-1 ml-1 mr-3 text-3xl md:text-5xl"
    ]
    [ HH.text content ]

navBarIcon :: forall i. { link :: String, path :: String } -> HH.HTML i Action
navBarIcon { link, path } =
  HH.a
    [ HP.href link, cn "" ]
    [ HH.img
        [ HP.src $ "/images/logos/" <> path
        , cn "block w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 m-1"
        ]
    ]

navBarIconGroup ::
  forall i a.
  { elements :: Array (HH.HTML i a) } -> HH.HTML i a
navBarIconGroup { elements } =
  HH.div
    [ cn "flex flex-row m-2" ]
    elements

navBarButtonGroup ::
  forall i a.
  { elements :: Array (HH.HTML i a) } -> HH.HTML i a
navBarButtonGroup { elements } =
  HH.div
    [ cn "font-bold text-5xl flex flex-row lg:flex-col m-2" ]
    elements

{- writing pages -}
navBar :: forall i. HH.HTML i Action
navBar =
  HH.div [ cn "lg:absolute flex justify-between flex-row lg:flex-col" ]
    [ navBarButtonGroup
        { elements:
            [ navBarButton { action: SwitchPage Main, content: "Home" }
            , navBarButton { action: SwitchPage BlogList, content: "Blog" }
            ]
        }
    , navBarIconGroup
        { elements:
            [ navBarIcon { link: "https://twitter.com/Mattwittus", path: "mmesch.png" }
            , navBarIcon { link: "https://github.com/mmesch", path: "github.png" }
            ]
        }
    ]

container :: forall i a. Array (HH.HTML i a) -> HH.HTML i a
container content = HH.div [ cn "w-full max-w-colwidth block mx-auto" ] content

list :: forall i. Posts -> HH.HTML i Action
list posts =
  HH.div [ cn "bg-white block p-3 flex flex-col" ]
    $ reverse
        (toUnfoldable (values posts))
    <#> listCard

listCard :: forall i. Post -> HH.HTML i Action
listCard post =
  let
    cardStyle = "hover:cursor-pointer block p-6 mb-6 border-gray border-b-2 rounded-lg"
  in
    case post.external of
      Nothing ->
        HH.a
          [ HP.href $ "#/blog/" <> fromMaybe "" post.id, cn cardStyle ]
          [ HH.div [ cn "block text-lg" ]
              [ HH.text $ fromMaybe "no title" post.title ]
          , HH.div [ cn "block" ] [ HH.text $ fromMaybe "no date" post.date ]
          ]
      Just url ->
        HH.a
          [ HP.href url, HP.target "_blank", cn cardStyle ]
          [ HH.div [ cn "block text-lg" ]
              [ HH.text $ "external: " <> fromMaybe "no title" post.title ]
          , HH.div [ cn "block" ] [ HH.text $ fromMaybe "no date" post.date ]
          ]

layout1 :: forall i. HH.HTML i Action
layout1 =
  HH.div [ cn "bg-palered" ]
    [ navBar
    , HH.text "Hey there"
    ]
