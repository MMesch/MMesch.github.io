module Pages where

import Prelude
import Types (State, Action, Posts, Post, CV)
import MarkdownIt (MarkdownIt)
import Halogen.HTML as HH
import Halogen.HTML.Properties as HP
import MarkdownIt.Renderer.Halogen (render_)
import Data.List (toUnfoldable)
import Data.Array (reverse, filter, (..), zipWith)
import Data.Maybe (fromMaybe, Maybe(Just, Nothing))
import Data.Either (Either(Left, Right))
import Data.Map (values)

-- simple navbar layout
layout1 :: forall i. Array (HH.HTML i Action) -> HH.HTML i Action
layout1 elements =
  HH.div [ cn "block" ]
    $ [ navBar
      , container elements
      ]
  where
  container :: forall i a. Array (HH.HTML i a) -> HH.HTML i a
  container = HH.div [ cn "w-full max-w-4xl block mx-auto px-1 md:px-3 py-3" ]

-- pages
blogList :: forall i. State -> HH.HTML i Action
blogList state =
  layout1
    $ [ list $ state.posts ]

mainPage :: forall i. Maybe CV -> HH.HTML i Action
mainPage maybeCV =
  layout1
    $ case maybeCV of
        Nothing -> [ HH.text "Couldn't load CV" ]
        Just cv ->
          [ HH.div [ cn "markdown mx-4" ]
              [ HH.p_ [ HH.text cv.summary ]
              , HH.h2_ [ HH.text "What I do" ]
              , HH.p_ [ HH.text cv.what ]
              , HH.h2_ [ HH.text "The fields I worked in" ]
              , HH.p_ [ HH.text cv.domains ]
              , HH.h2_ [ HH.text "My tech stack" ]
              , HH.p_ [ HH.text cv.stack ]
              , HH.h2_ [ HH.text "Experience" ]
              , HH.div_ (experienceCard <$> cv.experience)
              , HH.h2_ [ HH.text "Education" ]
              , HH.div_ (educationCard <$> cv.education)
              ]
          ]
  where
  experienceCard exp =
    HH.div [ cn "block border-2 p-2 m-2" ]
      [ HH.text $ exp.employer <> " (" <> exp.years <> ") ⇒ " <> exp.role ]

  educationCard edu =
    HH.div [ cn "block border-2 p-2 m-2" ]
      [ HH.text $ edu.institution <> " - " <> edu.name <> " " <> edu.qualification ]

blogPage :: forall i. MarkdownIt -> Post -> HH.HTML i Action
blogPage markdownIt post =
  let
    markdown = fromMaybe "" post.content

    rendered = render_ markdownIt markdown

    title = fromMaybe "no title" post.title

    date = fromMaybe "no date" post.date
  in
    layout1
      [ HH.div [ cn "markdown max-w-4xl border-t-2 lg:border-0 border-gray px-3 mx-auto py-16" ]
          [ HH.div [ cn "text-gray-800 text-lg" ] [ HH.text date ]
          , HH.h1 [] [ HH.text title ]
          , case post.description of
              Nothing -> HH.div [] []
              Just description -> HH.div [ cn "abstract" ] [ HH.text description ]
          , rendered
          ]
      ]

-- This is a little helper to save some space
cn :: forall t5 t6. String -> HH.IProp ( class :: String | t6 ) t5
cn = HP.class_ <<< HH.ClassName

{- nav bar component -}
navBarButton ::
  forall i a.
  { href :: String, content :: String } ->
  HH.HTML i a
navBarButton { href, content } =
  HH.a
    [ HP.href href
    , cn "block hover:cursor-pointer my-1 ml-1 mr-5 text-3xl md:text-5xl"
    ]
    [ HH.text content ]

navBarIcon :: forall i. { link :: String, path :: String } -> HH.HTML i Action
navBarIcon { link, path } =
  HH.a
    [ HP.href link, cn "" ]
    [ HH.img
        [ HP.src $ "/images/logos/" <> path
        , cn "block w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 m-1"
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
    [ cn "font-bold flex flex-row lg:flex-col m-2" ]
    elements

{- writing pages -}
navBar :: forall i. HH.HTML i Action
navBar =
  HH.div [ cn "lg:absolute flex justify-between flex-row lg:flex-col mb-10 lg:mb-0" ]
    [ navBarButtonGroup
        { elements:
            [ navBarButton { href: "#!/", content: "About" }
            , navBarButton { href: "#!/blog", content: "Blog" }
            ]
        }
    , navBarIconGroup
        { elements:
            [ navBarIcon { link: "https://twitter.com/Mattwittus", path: "mmesch.png" }
            , navBarIcon { link: "https://github.com/mmesch", path: "github.png" }
            , navBarIcon { link: "https://www.linkedin.com/in/mmesch", path: "logo-linkedin.png" }
            ]
        }
    ]

list :: forall i. Posts -> HH.HTML i Action
list posts = HH.div [ cn "bg-white pt-6 flex flex-col" ] elements
  where
  images = (\x -> "path" <> show x <> ".svg") <$> (filter (\x -> mod x 2 == 0) (1760 .. 1962))

  imageElements = (\path -> HH.img [ cn "hidden md:inline md:h-12 lg:h-16 mx-6 lg:mx-10", HP.src $ "./images/backgrounds/" <> path ]) <$> images

  postCards = reverse (toUnfoldable (values posts)) <#> listCard

  elements = zipWith (\a b -> HH.div [ cn "flex flex-row items-center" ] [ a, b ]) imageElements postCards

listCard :: forall i. Post -> HH.HTML i Action
listCard post =
  let
    cardStyle = "hover:cursor-pointer w-full block p-4 md:p-6 my-3 border-solid border-2 rounded-lg"

    href = fromMaybe ("#!/blog/" <> fromMaybe "" post.id) post.external

    externalTag = HH.span [ cn "text-red-800 font-bold" ] [ HH.text "external: " ]
  in
    HH.a
      ( [ HP.href href, cn cardStyle ]
          <> if post.external == Nothing then [] else [ HP.target "_blank" ]
      )
      [ HH.div [ cn "block text-lg" ]
          $ ( if post.external /= Nothing then
                [ externalTag ]
              else
                []
            )
          <> [ HH.text $ fromMaybe "no title" post.title ]
      , HH.div [ cn "block text-sm my-2" ]
          [ HH.text $ fromMaybe "" post.description ]
      , HH.div [ cn "block" ]
          [ HH.text $ fromMaybe "no date" post.date ]
      ]
