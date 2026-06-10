module Markdown where

import Prelude
import Effect (Effect)

foreign import render :: String -> Effect String
foreign import setInnerHTML :: String -> String -> Effect Unit
