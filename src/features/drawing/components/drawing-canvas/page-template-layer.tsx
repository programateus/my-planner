import { Group, Picture, Skia, type SkPicture } from "@shopify/react-native-skia";
import { memo } from "react";

import { getPageBounds } from "@/features/drawing/geometry/notebook-geometry";

export const PageTemplateLayer = memo(function PageTemplateLayer({
  pageIndex,
  picture,
}: {
  pageIndex: number;
  picture: SkPicture;
}) {
  const bounds = getPageBounds(pageIndex);
  return (
    <Group clip={Skia.XYWHRect(bounds.x, bounds.y, bounds.width, bounds.height)}>
      <Group transform={[{ translateY: bounds.y }]}>
        <Picture picture={picture} />
      </Group>
    </Group>
  );
});
