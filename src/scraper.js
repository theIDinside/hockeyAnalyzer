const phantom = require('phantom');

phantom.crea

module.exports = function(url) {  
  phantom.create(function(ph) {
    return ph.createPage(function(page) {
      return page.open(url, function(status) {
        console.log("opened site? ", status);         

          page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
            //jQuery Loaded.
            //Wait for a bit for AJAX content to load on the page. Here, we are waiting 0.1 seconds.
            setTimeout(function() {
              return page.evaluate(function(selector) {
                
                // Get what you want from the page using jQuery. 
                // A good way is to populate an object with all the 
                // jQuery commands that you need and then return the object.
                var teamStanding = [];

                let data = $('div.rt-body').text()
                console.log(data)
                return {
                  sizes: 1
                };
              }, function(result) {
                // Call the sites filter function to filter out unavailable sizes
                result = site.filterFunction(result);
                // send the result back to the user.
                res.send(result);
                // Close PhantomJS
                ph.exit();
              }, site.queryStrings);
            }, 2000);

          });
        });
      });
  });
}