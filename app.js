var express = require('express');


var app = express();
// let port = process.env.PORT || 80;
var server = app.listen(process.env.PORT || 80, listen);

app.set('view engine', 'pug');

// This call back just tells us that the server has started
 function listen() {
 var host = server.address().address;
 var port = server.address().port;
 console.log('Example app listening at http://' + host + ':' + port);
 }

app.get('/', doThing);

function doThing(req, res){
	res.send('Helooooooooooo there!');
	// res.render('index');

	// load image from file
	// const mat = cv.imread('./images/img1.jpg');
	// cv.imreadAsync('./images/img1.jpg', (err, mat) => {
	// res.send(mat)
	// })

	// cv.imshow('a window name', mat);
	// cv.waitKey();
}

app.get('/image/:imgurl', detectImage);
const cv = require('opencv4nodejs');
const fs = require('fs');
const path = require('path');
function detectImage(req, res){
	var imgurl = req.params['imgurl'] || 'daryl-rick.jpg';

	if (!cv.xmodules.face) {
	  throw new Error('exiting: opencv4nodejs compiled without face module');
	}

	const basePath = './data/face-recognition';
	const imgsPath = path.resolve(basePath, 'imgs');
	const nameMappings = ['daryl', 'rick', 'negan'];

	const imgFiles = fs.readdirSync(imgsPath);

	const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
	const getFaceImage = (grayImg) => {
	  const faceRects = classifier.detectMultiScale(grayImg).objects;
	  if (!faceRects.length) {
	    throw new Error('failed to detect faces');
	  }
	  return grayImg.getRegion(faceRects[0]);
	};

	const trainImgs = imgFiles
	  // get absolute file path
	  .map(file => path.resolve(imgsPath, file))
	  // read image
	  .map(filePath => cv.imread(filePath))
	  // face recognizer works with gray scale images
	  .map(img => img.bgrToGray())
	  // detect and extract face
	  .map(getFaceImage)
	  // face images must be equally sized
	  .map(faceImg => faceImg.resize(80, 80));

	// make labels
	const labels = imgFiles
	  .map(file => nameMappings.findIndex(name => file.includes(name)));

	const lbph = new cv.LBPHFaceRecognizer();
	lbph.train(trainImgs, labels);

	const twoFacesImg = cv.imread(path.resolve(basePath, imgurl));
	const result = classifier.detectMultiScale(twoFacesImg.bgrToGray());

	const minDetections = 10;
	result.objects.forEach((faceRect, i) => {
	  if (result.numDetections[i] < minDetections) {
	    return;
	  }
	  const faceImg = twoFacesImg.getRegion(faceRect).bgrToGray();
	  const who = nameMappings[lbph.predict(faceImg).label];

	  const rect = cv.drawDetection(
	    twoFacesImg,
	    faceRect,
	    { color: new cv.Vec(255, 0, 0), segmentFraction: 4 }
	  );

	  const alpha = 0.4;
	  cv.drawTextBox(
	    twoFacesImg,
	    new cv.Point(rect.x, rect.y + rect.height + 10),
	    [{ text: who }],
	    alpha
	  );
	 // console.log(who);
	});

	//console.log(twoFacesImg);
	res.send(twoFacesImg);
	// cv.imshowWait('result', twoFacesImg);
}
//
//app.get('/video/', detectVideo);
//function detectVideo(){
//	const { grabFrames, drawRectAroundBlobs } = require('./examples/utils');
//
//	const bgSubtractor = new cv.BackgroundSubtractorMOG2();
//
//	const delay = 100;
//	grabFrames('./data/horses.mp4', delay, (frame) => {
//	  const frameHLS = frame.cvtColor(cv.COLOR_BGR2HLS);
//
//	  const brownUpper = new cv.Vec(10, 60, 165);
//	  const brownLower = new cv.Vec(5, 20, 100);
//	  console.log(brownLower);
//	  const rangeMask = frameHLS.inRange({ z: 100, y: 20, x: 5 }, brownUpper);
//
//	  const blurred = rangeMask.blur(new cv.Size(10, 10));
//	  const thresholded = blurred.threshold(100, 255, cv.THRESH_BINARY);
//
//	  const minPxSize = 200;
//	  const fixedRectWidth = 50;
//	  drawRectAroundBlobs(thresholded, frame, minPxSize, fixedRectWidth);
//
//	  cv.imshow('rangeMask', rangeMask);
//	  cv.imshow('thresholded', thresholded);
//	  cv.imshow('frame', frame);
//	});
//}
//
//
//app.get('/video2/', detectVideo2);
//function detectVideo2(){
//	const { grabFrames, drawRectAroundBlobs } = require('./examples/utils');
//
//	const bgSubtractor = new cv.BackgroundSubtractorMOG2();
//
//	const delay = 50;
//	grabFrames('./data/traffic.mp4', delay, (frame) => {
//	  // const foreGroundMask = bgSubtractor.apply(frame);
//		const foreGroundMask = bgSubtractor.apply(frame);
//
//	  const iterations = 2;
//	  const dilated = foreGroundMask.dilate(
//	    cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(4, 4)),
//	    new cv.Point(-1, -1),
//	    iterations
//	  );
//	  const blurred = dilated.blur(new cv.Size(10, 10));
//	  const thresholded = blurred.threshold(200, 255, cv.THRESH_BINARY);
//
//	  const minPxSize = 4000;
//	  drawRectAroundBlobs(thresholded, frame, minPxSize);
//
//	  cv.imshow('foreGroundMask', foreGroundMask);
//	  cv.imshow('thresholded', thresholded);
//	  cv.imshow('frame', frame);
//	});
//}
//
//app.get('/async/', ()=>{
//
//	const detectAndComputeAsync = (det, img) =>
//	  det.detectAsync(img)
//	    .then(kps => det.computeAsync(img, kps)
//	                      .then(desc => ({ kps, desc }))
//	    );
//
//	const img1 = cv.imread('./data/s0.jpg');
//	const img2 = cv.imread('./data/s1.jpg');
//
//	const detectorNames = [
//	  'AKAZE',
//	  'BRISK',
//	  'KAZE',
//	  'ORB'
//	];
//
//	const createDetectorFromName = name => new cv[`${name}Detector`]();
//
//	// create 4 promises -> each detector detects and computes descriptors for
//	// img1 and img2
//	const promises = detectorNames
//	  .map(createDetectorFromName)
//	  .map(det =>
//	    // also detect and compute descriptors for img1 and img2 async
//	    Promise.all([detectAndComputeAsync(det, img1), detectAndComputeAsync(det, img2)])
//	      .then(allResults =>
//	        cv.matchBruteForceAsync(
//	          allResults[0].desc,
//	          allResults[1].desc
//	        )
//	        .then(matches => ({
//	          matches,
//	          kps1: allResults[0].kps,
//	          kps2: allResults[1].kps
//	        }))
//	      )
//	);
//
//	Promise.all(promises)
//	  .then((allResults) => {
//	    allResults.forEach((result, i) => {
//	      const drawMatchesImg = cv.drawMatches(
//	        img1,
//	        img2,
//	        result.kps1,
//	        result.kps2,
//	        result.matches
//	      );
//	      cv.imshowWait(detectorNames[i], drawMatchesImg);
//	      cv.destroyAllWindows();
//	    });
//	  })
//	  .catch(err => console.error(err));
//})
