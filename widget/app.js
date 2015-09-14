'use strict';

(function (angular, buildfire) {
  angular.module('contactUsPluginWidget', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controllerAs: 'WidgetHome',
          controller: 'WidgetHomeCtrl'
        })
        .otherwise('/');
    }])
    .filter('getImageUrl', ['Buildfire', function (Buildfire) {
      return function (url, width, height, type) {
        if (type == 'resize')
          return Buildfire.imageLib.resizeImage(url, {
            width: width,
            height: height
          });
        else
          return Buildfire.imageLib.cropImage(url, {
            width: width,
            height: height
          });
      }
    }])
    .directive("buildFireCarousel", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel:LOADED");
        }
      };
    }])
    .directive("googleMap", function () {
      return {
        template: "<div></div>",
        replace: true,
        scope: {coordinates: '='},
        link: function (scope, elem, attrs) {
          scope.$watch('coordinates', function (newValue, oldValue) {
            if (newValue) {
              scope.coordinates = newValue;
              if (scope.coordinates.length) {
                var map = new google.maps.Map(elem[0], {
                  center: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                  zoomControl: false,
                  streetViewControl: false,
                  mapTypeControl: false,
                  zoom: 15,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                var marker = new google.maps.Marker({
                  position: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                  map: map
                });
              }
            }
          }, true);
        }
      }
    })
    .directive("backgroundImage", ['$filter', function ($filter) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var getImageUrlFilter = $filter("getImageUrl");
          var setBackgroundImage = function (backgroundImage) {
            if (backgroundImage) {
              element.css(
                'background', '#010101 url('
                + getImageUrlFilter(backgroundImage, 342, 770, 'resize')
                + ') repeat fixed top center');
            } else {
              element.css('background', 'none');
            }
          };
          attrs.$observe('backgroundImage', function (newValue) {
            setBackgroundImage(newValue);
          });
        }
      };
    }])// Directive for adding  Image carousel on widget layout 2
    .directive('imageCarousel', function () {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          scope.carousel = null;
          scope.isCarouselInitiated = false;
          function initCarousel() {
            scope.carousel = null;
            setTimeout(function () {
              var obj = {
                'slideSpeed': 300,
                'dots': false,
                'autoplay': true,
                'margin': 10
              };

              var totalImages = parseInt(attrs.imageCarousel, 10);
              if (totalImages) {
                if (totalImages > 1) {
                  obj['loop'] = true;
                }
                scope.carousel = $(elem).owlCarousel(obj);
                scope.isCarouselInitiated = true;
              }
              scope.$apply();
            }, 100);
          }

          initCarousel();

          scope.$watch("imagesUpdated", function (newVal, oldVal) {
            if (newVal) {
              if (scope.isCarouselInitiated) {
                scope.carousel.trigger("destroy.owl.carousel");
                scope.isCarouselInitiated = false;
              }
              $(elem).find(".owl-stage-outer").remove();
              initCarousel();
            }
          });
        }
      }
    });
})(window.angular, window.buildfire);