/** Flickr REST API client to get tile images from image search results
  * Requires an API key (not included in this source code).
  *
  * favorite results so far (in descending order of color contrast):
  *   california landmarks
  *   olympic peninsula
  *   desert flowers
  *   exotic fruit
  *   tropical island
  *   tropical flowers
  *   hummingbird
  *   heirloom tomato
  *   cactus
  */

function FlickrAPI (apiKey, imageSize) {

  // https://www.flickr.com/services/api/misc.urls.html
  function get_flickr_thumbnail_url(photo) {
    const server = photo.getAttribute("server");
    const secret = photo.getAttribute("secret");
    const imgId = photo.getAttribute("id");
    return `https://live.staticflickr.com/${server}/${imgId}_${secret}_s.jpg`;
  };

  function load_image_from_url(imgUrl) {
    console.log(`loading image from ${imgUrl}`);
    //const tileImg = new Image();
    const tileImg = document.createElement("img");
    tileImg.src = imgUrl;
    return tileImg;
  };

  // https://www.flickr.com/services/api/flickr.photos.search.html
  function search_flickr(searchText, onComplete) {
    if (searchText !== undefined) {
      const maxPerPage = 500; // API limit, default is 100
      const base_url = "https://www.flickr.com/services/rest/?method=flickr.photos.search";
      const url = `${base_url}&text=${searchText}&api_key=${apiKey}&sort=relevance&per_page=${maxPerPage}`;
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
          const result = xhr.responseXML;
          const photos = Array.from(result.getElementsByTagName("photo"));
          // TODO randomization
          const flickrUrls = photos.slice(0, 36).map(get_flickr_thumbnail_url);
          const flickrImages = flickrUrls.map(load_image_from_url);
          return onComplete(flickrImages);
        }
      };
      xhr.open('get', url, true);
      xhr.send();
    }
  };

  if (apiKey !== undefined) {
    return search_flickr;
  } else {
    return null;
  }
};
