module External where

import Prelude
import Effect.Unsafe (unsafePerformEffect)
import Effect.Uncurried (EffectFn2, runEffectFn2)
import Foreign (Foreign)

foreign import _highlight :: EffectFn2 String String String

foreign import _katex :: Foreign

highlight :: String -> String -> String
highlight s1 s2 = unsafePerformEffect $ runEffectFn2 _highlight s1 s2

katex :: Foreign
katex = _katex
