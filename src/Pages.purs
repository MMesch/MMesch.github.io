module Pages where

import Prelude
import Types (State, Action, Post)
import Components (cn, navBar, list, container)
import Data.Maybe (fromMaybe)
import MarkdownIt (MarkdownIt)
import Halogen.HTML as HH
import MarkdownIt.Renderer.Halogen (render_)
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
    HH.div [ cn "block markdown" ]
      [ navBar
      , HH.div [ cn "max-w-colwidth mx-auto" ]
          [ HH.h1 [] [ HH.text title ]
          , HH.div [ cn "mb-10 text-xl" ] [ HH.text date ]
          , rendered
          ]
      ]
