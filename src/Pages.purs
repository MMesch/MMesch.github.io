module Pages where

import Prelude
import Types (State, Action(SwitchPage), Posts, Post, CV, Page(Main, Blog, BlogList))
import Halogen.HTML as HH
import Halogen.HTML.Properties as HP
import Halogen.HTML.Events as HE
import Data.List (toUnfoldable)
import Data.Array (reverse)
import Data.Maybe (fromMaybe, Maybe(Just, Nothing))
import Web.UIEvent.MouseEvent as MouseEvent
import Data.Map (values)

layout1 :: forall i. Array (HH.HTML i Action) -> HH.HTML i Action
layout1 elements =
  HH.div [ cn "min-h-screen bg-white text-gray-800" ]
    [ navBar
    , HH.div [ cn "max-w-4xl mx-auto px-4 py-8" ] elements
    ]

loadingPage :: forall i. HH.HTML i Action
loadingPage = layout1 [ HH.text "Loading..." ]

mainPage :: forall i. Maybe CV -> HH.HTML i Action
mainPage maybeCV =
  layout1
    $ case maybeCV of
        Nothing -> [ HH.text "Loading..." ]
        Just cv ->
          [ HH.div [ cn "text-base" ]
              [ HH.h1 [ cn "text-gray-800 text-2xl font-bold mb-6" ] [ HH.text cv.summary ]
              , sectionHeader "What I do"
              , HH.p_ [ HH.text cv.what ]
              , sectionHeader "Fields I worked in"
              , HH.p_ [ HH.text cv.domains ]
              , sectionHeader "Tech stack"
              , HH.p_ [ HH.text cv.stack ]
              , sectionHeader "Experience"
              , HH.div_ (experienceCard <$> cv.experience)
              , sectionHeader "Education"
              , HH.div_ (educationCard <$> cv.education)
              ]
          ]
  where
  sectionHeader text = HH.h2 [ cn "text-gray-700 text-base mt-8 mb-2 font-semibold" ]
    [ HH.span [ cn "text-gray-500 mr-4", HP.style "vertical-align: middle; position: relative; top: -3px" ] [ HH.text "▸ ▸ ▸" ]
    , HH.text text
    ]

  experienceCard exp =
    HH.div [ cn "border-l-2 border-gray-200 pl-3 my-3 text-sm" ]
      [ HH.div [ cn "text-gray-800" ] [ HH.text exp.employer ]
      , HH.div [ cn "text-gray-500" ] [ HH.text $ exp.role <> " (" <> exp.years <> ")" ]
      ]

  educationCard edu =
    HH.div [ cn "border-l-2 border-gray-200 pl-3 my-3 text-sm" ]
      [ HH.div [ cn "text-gray-800" ] [ HH.text edu.qualification ]
      , HH.div [ cn "text-gray-500" ] [ HH.text $ edu.institution <> " — " <> edu.name ]
      ]

blogPage :: forall i. Post -> HH.HTML i Action
blogPage post =
  let
    html = fromMaybe "" post.content
    title = fromMaybe "no title" post.title
    date = fromMaybe "no date" post.date
  in
    layout1
      [ HH.div [ cn "markdown max-w-4xl" ]
          [ HH.div [ cn "text-gray-500 text-base mb-4" ] [ HH.text date ]
          , HH.h1 [ cn "text-gray-800 text-2xl font-bold mb-6" ] [ HH.text title ]
          , case post.description of
              Nothing -> HH.div [] []
              Just description -> HH.div_ 
                [ HH.div [ cn "abstract" ] [ HH.text description ]
                , HH.hr []
                ]
          , HH.div [ cn "post-content", HP.id "post-content" ] []
          ]
      ]

blogList :: forall i. State -> HH.HTML i Action
blogList state =
  layout1
    [ HH.div [ cn "text-base" ]
        [ HH.h1 [ cn "text-gray-800 text-xl mb-8" ] [ HH.text "Blog" ]
        , HH.div_ (reverse (toUnfoldable (values state.posts)) <#> listCard)
        ]
    ]

listCard :: forall i. Post -> HH.HTML i Action
listCard post =
  let
    postId = fromMaybe "" post.id
    href = fromMaybe ("/blog/" <> postId) post.external
  in
    HH.a
      ( [ HP.href href
        , cn "block py-3 border-b border-gray-200 hover:bg-gray-50"
        ]
          <> case post.external of
              Nothing -> [ HE.onClick $ MouseEvent.toEvent >>> SwitchPage (Blog postId) ]
              Just _ -> [ HP.target "_blank" ]
      )
      [ HH.div [ cn "flex flex-row justify-between items-baseline" ]
          [ HH.div [ cn "text-gray-700" ]
              $ [ HH.text $ fromMaybe "no title" post.title ]
              <> case post.external of
                  Nothing -> []
                  Just _ -> [ HH.span [ cn "text-gray-400 ml-2" ] [ HH.text "[external]" ] ]
          , HH.div [ cn "text-gray-500 text-base ml-6 shrink-0" ]
              [ HH.text $ fromMaybe "" post.date ]
          ]
      , HH.div [ cn "text-gray-500 text-sm mt-1 max-w-2xl" ]
          [ HH.text $ fromMaybe "" post.description ]
      ]

cn :: forall t5 t6. String -> HH.IProp ( class :: String | t6 ) t5
cn = HP.class_ <<< HH.ClassName

navBar :: forall i. HH.HTML i Action
navBar =
  HH.div_
    [ HH.div [ cn "px-6 py-4" ]
        [ HH.div [ cn "max-w-4xl mx-auto flex flex-row justify-between items-center text-base" ]
            [ HH.div [ cn "flex flex-row gap-8" ]
                [ navLink "/" "About" Main
                , navLink "/blog" "Blog" BlogList
                ]
            , HH.div [ cn "flex flex-row gap-4 text-sm" ]
                [ HH.a [ HP.href "https://github.com/mmesch", cn "text-gray-500 hover:text-gray-800", HP.target "_blank" ] [ HH.text "GitHub" ]
                , HH.a [ HP.href "https://www.linkedin.com/in/mmesch", cn "text-gray-500 hover:text-gray-800", HP.target "_blank" ] [ HH.text "LinkedIn" ]
                , HH.a [ HP.href "https://fosstodon.org/@mattodon", cn "text-gray-500 hover:text-gray-800", HP.target "_blank" ] [ HH.text "Mastodon" ]
                ]
            ]
        ]
    , HH.div [ cn "nav-border" ] []
    ]
  where
  navLink href text page =
    HH.a
      [ HP.href href
      , HE.onClick $ MouseEvent.toEvent >>> SwitchPage page
      , cn "text-gray-500 hover:text-gray-800 no-underline tracking-wide"
      ]
      [ HH.text text ]
