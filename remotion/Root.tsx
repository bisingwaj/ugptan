import { Composition } from "remotion";
import { UgptanIntro } from "./compositions/UgptanIntro";
import { KeyFigures } from "./compositions/KeyFigures";

/** Catalogue des animations UGPTAN (éditables en code, prévisualisables en Studio). */
export const RemotionRoot = () => {
  return (
    <>
      <Composition id="UgptanIntro" component={UgptanIntro} durationInFrames={150} fps={30} width={1920} height={1080} />
      <Composition id="UgptanIntroVertical" component={UgptanIntro} durationInFrames={150} fps={30} width={1080} height={1920} />
      <Composition id="KeyFigures" component={KeyFigures} durationInFrames={210} fps={30} width={1920} height={1080} />
    </>
  );
};
