module Markdown where

import Prelude
import Effect (Effect)

foreign import render :: String -> Effect String
