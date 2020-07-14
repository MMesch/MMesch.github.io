{-# LANGUAGE OverloadedStrings #-}

-------------------------------------------------------------------------------

import Data.Monoid (mappend)
import Debug.Trace
import Hakyll
import Hakyll.Web.Sass (sassCompiler)
import System.FilePath
  ( dropExtension,
    joinPath,
    replaceExtension,
    splitDirectories,
    splitPath,
    takeBaseName,
    takeExtension,
  )
import System.Process (rawSystem)

-------------------------------------------------------------------------------
main :: IO ()
main = hakyll $ do
  --
  match "images/**/*" $ do
    route idRoute
    compile copyFileCompiler
  --
  match "images/gallery/**/*.png" $ version "small" $ do
    route $ customRoute $ \identifier ->
      moveDownIntoDirectory "small" (toFilePath identifier)
    compile $ do
      i <- toFilePath <$> getUnderlying
      TmpFile o <- newTmpFile $ "out" <> takeExtension i
      _ <-
        unsafeCompiler $
          rawSystem "convert" ["-resize", "400x", "-filter", "Sinc", i, o]
      makeItem $ TmpFile o
  --
  match "images/gallery/**/*.svg" $ version "small" $ do
    route $ customRoute $ \identifier ->
      moveDownIntoDirectory "small" $
        replaceExtension (toFilePath identifier) ".png"
    compile $ do
      i <- toFilePath <$> getUnderlying
      TmpFile o <- newTmpFile "out.png"
      _ <- unsafeCompiler $ rawSystem "inkscape" ["-z", "-w=300", "-e", o, i]
      makeItem $ TmpFile o
  --
  match "css/*.css" $ do
    route idRoute
    compile compressCssCompiler
  --
  match "css/*.scss" $ do
    route $ setExtension "css"
    let compressCssItem = fmap compressCss
    compile (compressCssItem <$> sassCompiler)
  --
  match (fromList ["contact.markdown"]) $ do
    route $ setExtension "html"
    compile $
      pandocCompiler
        >>= loadAndApplyTemplate "templates/default.html" defaultContext
        >>= relativizeUrls
  --
  match (fromList ["home.markdown"]) $ do
    route $ constRoute "index.html"
    compile $
      pandocCompiler
        >>= loadAndApplyTemplate "templates/home.html" defaultContext
        >>= loadAndApplyTemplate "templates/default.html" defaultContext
        >>= relativizeUrls
  --
  match "blog/*.md" $ do
    route $ setExtension "html"
    compile $
      pandocCompiler
        >>= loadAndApplyTemplate "templates/post.html" postCtx
        >>= loadAndApplyTemplate "templates/default.html" postCtx
        >>= relativizeUrls
  --
  create ["blog/index.html"] $ do
    route idRoute
    compile $ do
      posts <- recentFirst =<< loadAll "blog/*.md"
      let archiveCtx =
            listField "posts" postCtx (return posts)
              <> constField "title" "Archives"
              <> defaultContext
      makeItem "<p>Hey there</p>"
        >>= loadAndApplyTemplate "templates/post-list.html" archiveCtx
        >>= loadAndApplyTemplate "templates/default.html" defaultContext
        >>= relativizeUrls
  --
  create ["viz/index.html"] $ do
    route idRoute
    compile $ do
      verticals <- loadAll ("images/gallery/verticals/*" .&&. hasNoVersion) :: Compiler [Item CopyFile]
      animals <- loadAll ("images/gallery/animals/*" .&&. hasNoVersion) :: Compiler [Item CopyFile]
      scenes <- loadAll ("images/gallery/scenes/*" .&&. hasNoVersion) :: Compiler [Item CopyFile]
      blues <- loadAll ("images/gallery/blues/*" .&&. hasNoVersion) :: Compiler [Item CopyFile]
      let galleryCtx =
            constField "title" "viz"
              <> listField "verticals" imageCtx (return verticals)
              <> listField "animals" imageCtx (return animals)
              <> listField "scenes" imageCtx (return scenes)
              <> listField "blues" imageCtx (return blues)
              <> defaultContext
      makeItem ""
        >>= loadAndApplyTemplate "templates/viz.html" galleryCtx
        >>= loadAndApplyTemplate "templates/default.html" defaultContext
        >>= relativizeUrls
  --
  match "templates/*" $ compile templateBodyCompiler

--------------------------------------------------------------------------------
imageCtx :: Context a
imageCtx =
  mconcat
    [ urlField "url",
      field "thumbnail" $ \item -> do
        route <- getRoute $ itemIdentifier item
        let fp = maybe mempty id $ route
            tn = moveDownIntoDirectory "small" $ replaceExtension fp ".png"
        return $ toUrl tn,
      missingField
    ]

postCtx :: Context String
postCtx =
  dateField "date" "%B %e, %Y"
    `mappend` metadataField
    `mappend` defaultContext

moveDownIntoDirectory :: String -> FilePath -> FilePath
moveDownIntoDirectory dir = joinPath . go . splitDirectories
  where
    go [] = []
    go [x] = dir : [x]
    go (x : xs) = x : go xs
