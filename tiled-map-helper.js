handlePixelRatio(2, 'public/assets/levels@1.json', 'public/assets/levels@2.json');
handlePixelRatio(3, 'public/assets/levels@1.json', 'public/assets/levels@3.json');

function handlePixelRatio(pixelRatio, srcPath, dstPath) {
  console.log('handlePixelRatio for: ', pixelRatio);
  const fs = require('fs');
  let mapContent = fs.readFileSync(srcPath);
  let map = JSON.parse(mapContent);
  changeToPixelRatio(map, pixelRatio);

  let newMapContent = JSON.stringify(map, null, 2);
  fs.writeFileSync(dstPath, newMapContent);
}

function changeToPixelRatio(map, pixelRatio) {
  map.tilewidth *= pixelRatio;
  map.tileheight *= pixelRatio;

  for (const tileset of map.tilesets) {
    tileset.imagewidth = calculateNewWidthForTileset(tileset, pixelRatio);
    tileset.imageheight = calculateNewHeightForTileset(tileset, pixelRatio);
    tileset.tilewidth *= pixelRatio;
    tileset.tileheight *= pixelRatio;
    tileset.image = tileset.image.replace('@1', `@${pixelRatio}`);
    tileset.name = tileset.name.replace('@1', `@${pixelRatio}`);
  }

  for (const layer of map.layers) {
    if (layer.type === 'objectgroup') {
      for (const object of layer.objects) {
        object.width *= pixelRatio;
        object.height *= pixelRatio;
        object.x *= pixelRatio;
        object.y *= pixelRatio;
      }
    }
  }
}

function calculateNewWidthForTileset(tileset, pixelRatio) {
  const iw = tileset.imagewidth;
  const tw = tileset.tilewidth;
  const columns = tileset.columns;
  const spacingAndMarginForWidth = iw - tw * columns;
  const widthWithoutSpaceAndMargin = iw - spacingAndMarginForWidth;
  return widthWithoutSpaceAndMargin * pixelRatio + spacingAndMarginForWidth;
}

function calculateNewHeightForTileset(tileset, pixelRatio) {
  const ih = tileset.imageheight;
  const th = tileset.tileheight;
  const rows = tileset.tilecount / tileset.columns;
  const spacingAndMarginForHeight = ih - th * rows;
  const heightWithoutSpaceAndMargin = ih - spacingAndMarginForHeight;
  return heightWithoutSpaceAndMargin * pixelRatio + spacingAndMarginForHeight;
}
