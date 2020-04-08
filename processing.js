var model;

async function loadModel() {
  // await causes the function to wait for loadGraphModel to finish even
  // though by default it is asynchronous
  model = await tf.loadGraphModel('Converted_Model/model.json');
}


function predictImage() {
  let image = cv.imread(canvas);
  cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

  // Get contours
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  // crop image based on bounding rect of contour
  let contour = contours.get(0);
  let rect = cv.boundingRect(contour);
  image = image.roi(rect);
  // resize image to be 20px on long edge
  var height = image.rows;
  var width = image.cols;
  if (height > width) {
      const scaleFactor = height / 20;
      height = 20;
      width = Math.round(width / scaleFactor);
  }else {
    const scaleFactor = width / 20;
    width = 20;
    height = Math.round(height / scaleFactor);
  }
  let dsize = new cv.Size(width, height);
  cv.resize(image, image, dsize, 0, 0, cv.INTER_AREA);
  // Add padding
  // Alternate rounding up and down in case of odd numbered lengths
  const LEFT = Math.ceil(4+ (20 - width)/2);
  const RIGHT = Math.floor(4+ (20 - width)/2);
  const TOP = Math.ceil(4+ (20 - height)/2);
  const BOTTOM = Math.floor(4+ (20 - height)/2);
  const borderColour = new cv.Scalar(0, 0, 0, 0);
  cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, borderColour);
  // center of mass
  cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  contour = contours.get(0);
  const moments = cv.moments(contour, false);
  const cx = moments.m10 / moments.m00;
  const cy = moments.m01 / moments.m00;
  // shift center of mass
  const X_SHIFT = Math.round(image.cols / 2 - cx);
  const Y_SHIFT = Math.round(image.rows / 2 - cy);
  dsize = new cv.Size(image.cols, image.rows);
  let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT],);
  cv.warpAffine(image, image, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, borderColour)
  // normalize pixel values
  let pixelValues = image.data;
  pixelValues = Float32Array.from(pixelValues);
  pixelValues = pixelValues.map(function(item){
    return item / 255.0;
  });
  // create tensor
  const X = tf.tensor([pixelValues]);
  // predict
  const result = model.predict(X)
  const output = result.dataSync()[0];
  result.print();
  // cleanup
  image.delete();
  contours.delete();
  contour.delete();
  hierarchy.delete();
  M.delete();
  X.dispose();
  result.dispose();
  return output
}
