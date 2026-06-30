import { Composition } from "remotion";
import { UgptnIntro } from "./compositions/UgptnIntro";
import { KeyFigures } from "./compositions/KeyFigures";

/** Catalogue des animations UGPTN (éditables en code, prévisualisables en Studio). */
export const RemotionRoot = () => {
  return (
    <>
      <Composition id="UgptnIntro" component={UgptnIntro} durationInFrames={150} fps={30} width={1920} height={1080} />
      <Composition id="UgptnIntroVertical" component={UgptnIntro} durationInFrames={150} fps={30} width={1080} height={1920} />
      <Composition id="KeyFigures" component={KeyFigures} durationInFrames={210} fps={30} width={1920} height={1080} />
    </>
  );
};
