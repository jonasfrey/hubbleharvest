const https = require('https')
var HTMLParser = require('node-html-parser');
const Stream = require('stream').Transform   
const { exit } = require('process');
var buffer_image_size = require('buffer-image-size');
var image_size = require('image-size');
const { createCanvas, loadImage } = require('canvas')
var fs = require('fs');

var images_directory = "images";

if (!fs.existsSync("./"+images_directory)) {
  // Do something
  fs.mkdirSync("./"+images_directory);
}

fs = require('fs');
var make_absolute_url = function(maybe_relative_url, prefix = "https://hubblesite.org"){
  maybe_relative_url = maybe_relative_url.toString().replace("https://hubblesite.org", "");
  var absolute_url = prefix+maybe_relative_url;
  return absolute_url;
}
var make_request = function(options, callback){
  var port = 80;
  if(options.url.indexOf("https") != -1){
    var port = 443
  }
  
  
  const req = https.request(options.url, options, res => {
    console.log(`statusCode: ${res.statusCode}`)
    if(res.statusCode < 400 && res.statusCode >= 300){

      var new_location =  req.agent.protocol + "//"  + res.headers.host + "/" + res.headers.location;

      options.location_before_redirect = options.url;
      options.url = new_location; 
      console.log(options);

      return make_request(options, callback);

    }else{

      let data = '';

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      res.on('end', () => {
        // fs.writeFile("test.html", data.toString(),"utf-8", function(){
        //   console.log("done");
        // })
        const root = HTMLParser.parse(data.toString());
        var document = root; 
        callback(document);
        

      });


    }

  })
  
  req.on('error', error => {
    console.error(error)
  })
  
  req.end()
  
}

var draw_text_with_bg_square = function(ctx, options){

  var padding_xy_object = (options.padding_xy_object) ? options.padding_xy_object : {x: 20, y: 20};

  var location_xy_object = (options.location_xy_object) ? options.location_xy_object : {x: 20, y: 20};

  var alignment_xy_object = (options.alignment_xy_object) ? options.alignment_xy_object : {x: "end", y: "end"};

  var font_size = (options.font_size) ? options.font_size : 48;
  var font_family = (options.font_family) ? options.font_family : "Arial";

  var text = (options.text) ? options.text : "draw_text_with_bg_square_executed";


  ctx.font = font_size+'px '+font_family;

  var text_measure = ctx.measureText(text)

  text_measure.height = font_size
  

  var height = padding_xy_object.y*2 + text_measure.height; 
  var width = padding_xy_object.x*2 + text_measure.width; 

  //console.log(text_measure);

  ctx.fillStyle = (options.square_color) ? options.square_color : "rgba(0,0,0,0.7)"


  var posx = location_xy_object.x;
  var posy = location_xy_object.y; 

  if(["bottom", "end"].indexOf(alignment_xy_object.x) != -1){
    posx = ctx.canvas.width - width - posx; 
  }
  if(["bottom", "end"].indexOf(alignment_xy_object.y) != -1){
    posy = ctx.canvas.height - height - posy; 
  }

  ctx.fillRect(posx, posy, text_measure.width+padding_xy_object.x*2,text_measure.height+padding_xy_object.y*2)

  ctx.fillStyle = (options.text_color) ? options.text_color : "rgba(255,255,255, 0.7)"
  




  // var posx = location_xy_object.x+padding_xy_object.x
  // var posy = location_xy_object.y + padding_xy_object.y + (font_size / 2); 

  // if(["bottom", "end"].indexOf(alignment_xy_object.x) != -1){
  //   posx = ctx.canvas.width - width - posx; 
  // }
  // if(["bottom", "end"].indexOf(alignment_xy_object.y) != -1){
  //   posy = ctx.canvas.height - height - posy; 
  // }

  ctx.fillText(text, posx + padding_xy_object.x, posy+(text_measure.height)+padding_xy_object.y);

}

var max_page = 121; 
var min_page = 0; 
var rand_page = parseInt(Math.random()*max_page + min_page); 
var url = `https://hubblesite.org/resource-gallery/images?Topic=105-galaxies&filterUUID=4c394bbb-b21e-43ab-a160-2a4521d70243&page=${rand_page}&itemsPerPage=15&`
make_request({url:url}, function(document){
  var imgs = document.querySelectorAll("img")
  var rand_img = imgs[parseInt(Math.random()*imgs.length)];


  var title = rand_img.parentNode.parentNode.parentNode.querySelector(".text-overlay__center").innerText.trim()
  var maybe_relative_url = rand_img.parentNode.parentNode.parentNode.parentNode.getAttribute("href");
  var absolute_url = make_absolute_url(maybe_relative_url);
  //console.log({url:absolute_url, title:title});

  make_request({url: absolute_url}, function(document){

    (async () => {
      await fs.writeFile('./test.txt', document.innerHTML, 'utf8', function(){});
  })();
    var imgs = document.querySelectorAll(".media-library-links-list a")

    var biggest_img =  {
      el: imgs[0], 
      number_of_pixels: 0
    };
    // find image with hightest number / resolution
    for(var i = 0; i < imgs.length; i++){
      var img = imgs[i];
      var innerText = img.innerText; 
      console.log(innerText);
      var multiplication = innerText.toString().match(/([0-9]*\s*[xX*]{1}\s[0-9]*)/);
      if(!multiplication){
        continue;
      }
      // tiff or tif not supported yet
      if(innerText.toLowerCase().indexOf("tif") != -1){
        continue;
      }

      multiplication = multiplication[0];
      
      var number_of_pixels = multiplication.replace("x", "*");
        number_of_pixels = multiplication.replace("X", "*");
        number_of_pixels = new Function("return " +number_of_pixels)();

        if(number_of_pixels > biggest_img.number_of_pixels){
          biggest_img =  {
            el: img, 
            number_of_pixels: number_of_pixels
          };
        }
    }

    var img = biggest_img.el;

    //var img = imgs[imgs.length-1]
    //console.log(imgs, img);
    var img_url = img.getAttribute("href");
    //var absolute_url = make_absolute_url(img_url);
    var absolute_url = "https:"+img_url;
    var day_ts = parseInt(new Date().getTime()/1000/(60*60*24))*60*60*24;

    https.request(absolute_url, function(response) {                                        
      var data = new Stream();                                                    

      response.on('data', function(chunk) {                                       
        data.push(chunk);                                                         
      });                                                                         

      response.on('end', function() {         
        
        var buffer = data.read();

        var dimensions = image_size(buffer);
                          
        var original_image_file_name =  day_ts+"_"+img_url.split("/").pop()
         fs.writeFileSync( "./"+images_directory+"/"+original_image_file_name, buffer);  

         const canvas = createCanvas(dimensions.width, dimensions.height);

         const ctx = canvas.getContext('2d')
         ctx.fillRect(0, 0, dimensions.width, dimensions.height)
        //  var iData = new ImageData(buffer, dimensions.width, dimensions.height);
        //  ctx.putImageData(iData, 0, 0);
        //  const canvas_buffer = canvas.toBuffer('image/png')
        //  fs.writeFileSync(day_ts+"_"+img_url.split("/").pop(), buffer);       
         
         loadImage( "./"+images_directory+"/"+original_image_file_name).then(image => {
          var canvas_image_path_file_name = "from_canvas_"+original_image_file_name;
          var mimeend = canvas_image_path_file_name.split(".").pop();
          console.log(mimeend);
          ctx.drawImage(image, 0,0, dimensions.width, dimensions.height)

          var font_size = parseInt(dimensions.height/35);

          draw_text_with_bg_square(ctx, {

            font_size: font_size,
            font_family: "Arial",
            square_color: "rgba(0,0,0,0.7)",
            padding_xy_object: {x:font_size/2, y: font_size/2},
            location_xy_object: {x:20, y: 20},
            text_color: "rgba(255,255,255,0.7)",
            text: title

          })
          mimeend = mimeend.replace("jpg", "jpeg");
          const buffer = canvas.toBuffer('image/'+mimeend)
          fs.writeFileSync( "./"+images_directory+"/"+canvas_image_path_file_name, buffer)
        })
      });                                                                         
    }).end();






  })
})

