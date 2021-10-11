module Highlight where

import Prelude
import Effect.Unsafe (unsafePerformEffect)
import Effect.Uncurried (EffectFn2, runEffectFn2)

foreign import _highlight :: EffectFn2 String String String

highlight :: String -> String -> String
highlight s1 s2 = unsafePerformEffect $ runEffectFn2 _highlight s1 s2
