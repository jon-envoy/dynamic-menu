 jQuery(function($) {

   // Reset cookie if language changes
   $('.footer-language-selector .dropdown-menu a').click(function() {
     Cookies.remove(cookieTitle);
   });

   // START MENU JS 

   // Only do any of this on a page with dynamic menu

   if ($('#dynamic-menu-container #menu').length) {

     // Global vars

     // Get language first
     var sitePath = window.location.pathname.split('/');
     var siteLang = sitePath[2];

     // Get vars
     var numberX = Math.floor((Math.random() * 10000) + 1);
     var cookieTitle = 'dynamic_menu_zd_' + numberX;
     //var cookieTitle = 'dynamic_higherlogic_prod_1';
     var siteURL = '';
     var menuContainer = '#dynamic-menu-container #menu';

     // Functions
     var loadMenu = function() {

       // Star Categories
       $.ajax(siteURL + '/api/v2/help_center/' + siteLang + '/categories.json', {
           method: 'GET',
         })
         .always(function(data, textStatus, xhr) {
           //console.log('Cats: ' + data.categories); 

           var cats = data.categories;

           $(cats).each(function() {
             //console.log('cat: ' + this);
             var catID = this.id;
             var catlinkHtml = "<li class='cat-menu-list' id='cat-" + catID + "' data-cat-id='" + catID + "'><a href='#'> " + this.name + "</a></li>";

             $(menuContainer).append(catlinkHtml);


             // Start Sections
             $.ajax(siteURL + '/api/v2/help_center/' + siteLang + '/categories/' + catID + '/sections.json', {
                 method: 'GET',
               })
               .done(function(data, textStatus, xhr) {
                 //console.log('catid: ' + catID);

                 var sects = data.sections;
                 $(sects).each(function(i) {

                   // wrap in UL
                   if (i === 0) {
                     $(menuContainer + ' li#cat-' + catID).append('<ul class="section-sub-menu sub-menu">')
                   }

                   var sectID = this.id;
                   var sectName = this.name;
                   var sectParent = this.parent_section_id;


                   //console.log('Sec: '+ sectID + ' | Name: ' + sectName + ' | Sect parent: ' + sectParent);

                   // SKIP IF SECT HAS PARENT SET

                   if (sectParent != null) {
                     //console.log(sectName + ' has a parent');

                     // add relocation tag
                     var seclinkHtml = "<li class='menu-section needs-articles' id='sect-" + sectID + "' data-section-relocate='" + sectParent + "' data-sect-id='" + sectID + "'><a href='#'> " + this.name + "</a></li>";

                   } else {

                     // Regular section (no relocation tag)
                     var seclinkHtml = "<li class='menu-section needs-articles' id='sect-" + sectID + "' data-sect-id='" + sectID + "'><a href='#'> " + this.name + "</a></li>";
                   }

                   // Append to cat
                   $(menuContainer + ' li#cat-' + catID + ' ul.sub-menu').append(seclinkHtml);

                   var thisSect = $('#article-container').attr('section-id');
                   if (sectID == thisSect) {
                     console.log('same section');

                     // Start Articles

                     $.ajax(siteURL + '/api/v2/help_center/' + siteLang + '/sections/' + sectID + '/articles.json', {
                         method: 'GET',
                       })
                       .done(function(data, textStatus, xhr) {

                         var articles = data.articles;

                         $(articles).each(function(i) {

                           // wrap in UL
                           if (i === 0) {
                             $(menuContainer + ' li#sect-' + sectID).append('<ul class="article-sub-menu sub-menu">')
                           }

                           // Skip if draft
                           if (this.draft != true) {
                             var artID = this.id;
                             var artlinkHtml = "<li id='article-" + artID + "' data-art-id='" + artID + "'><a href='" + this.html_url + "'> " + this.title + "</a></li>";
                             $(menuContainer + ' li#sect-' + sectID + ' .article-sub-menu').append(artlinkHtml);
                           }
                         }); // End articles each

                       }); // End Articles container
                   } // End if section is itself

                 }); // End sections each
               }); // End sections container
           }); // End Categorey each
         }); // End Category container
     }; // End loadMenu

     /* AFTER SECTIONS LOADED ------------------------------------------------------ */

     var afterSectionsLoaded = function() {
       console.log('after sections loaded');

       $('.menu-section.needs-articles').each(function() {
         var sectID = $(this).attr('data-sect-id');
         var thisSect = $('#article-container').attr('section-id');

         if (sectID !== thisSect) {
           $(this).removeClass('needs-articles');

           $.ajax(siteURL + '/api/v2/help_center/' + siteLang + '/sections/' + sectID + '/articles.json', {
               method: 'GET',
             })
             .done(function(data, textStatus, xhr) {

               var articles = data.articles;

               $(articles).each(function(i) {

                 // wrap in UL
                 if (i === 0) {
                   $(menuContainer + ' li#sect-' + sectID).append('<ul class="article-sub-menu sub-menu">')
                 }

                 var artID = this.id;
                 var artlinkHtml = "<li id='article-" + artID + "' data-art-id='" + artID + "'><a href='" + this.html_url + "'> " + this.title + "</a></li>";
                 $(menuContainer + ' li#sect-' + sectID + ' .article-sub-menu').append(artlinkHtml);
               }); // End articles each

             }); // End Articles container
         }
       });
     }

     /* END AFTER SECTIONS LOADED -------------------------------------------------- */

     /* AFTER MENU IS LOADED ------------------------------------------------------ */

     var afterMenuLoaded = function() {


       // Move subsections to proper place
       $('.section-sub-menu li[data-section-relocate]').each(function() {

         $(this).addClass('sub-menu sub-sub-menu');

         var subSectID = $(this).attr('data-section-relocate');
         var parentSect = $('#sect-' + subSectID);
         var parentSectArticles = $('#sect-' + subSectID).find('> .article-sub-menu');

         // Move the sub-subection
         $(this).insertBefore(parentSectArticles);

         // Remove the duplicate
         // $('li.sub-sub-menu li.sub-sub-menu').remove();

       });

       // Setup cookie var
       var myCookie = Cookies.get(cookieTitle);

       // If cookie is not set then do the rest

       if (myCookie != 'true') {
         console.log("Cookie still not set");


         Cookies.set(cookieTitle, 'true', {
           expires: 7
         });

         // Save the HTML

         var savedHTML = $('#dynamic-menu-container').html();
         $.sessionStorage.setItem(cookieTitle, savedHTML);
       }


       // Load the menu when don
       $('#dynamic-menu-container').css('cssText', 'opacity:1; height:auto;')


       // Mark current page

       var thisArticle = $('#article-container').attr('data-article-id');
       $("li#article-" + thisArticle).addClass('current-article-li');
       $("li#article-" + thisArticle).parent().addClass('open current current-article');
       $("li#article-" + thisArticle).parent().parent().addClass('open current current-section');
       $("li#article-" + thisArticle).parent().parent().parent().addClass('open');
       $("li#article-" + thisArticle).parent().parent().parent().parent().addClass('open current current-category');


       // Sticky Dynamic Menu nav
       $('#dynamic-menu-container').stickybits();


       console.log("Menu JS is completed");

       $(document).one("ajaxStop", function() {
         initInteractions();
       });
     }

     /* AFTER INIT INTERACTIONS FUNCTION ------------------------------------------------------ */


     var initInteractions = function() {

       setTimeout(function() {

         console.log('load interactions');

         $('#dynamic-menu-container #menu a').not('.article-sub-menu a, .sub-sub-menu a').on('click', function(e) {
           e.preventDefault();

           // Assign open class
           if ($(this).parent().hasClass('open')) {

             $(this).parent().removeClass('open');
             $(this).parent().find('.open').removeClass('open');

           } else {

             // Remove all open classes first
             $('#dynamic-menu-container #menu .open').removeClass('open');

             // Add to the tree
             $(this).parent().addClass('open');
             $(this).parent().parent().addClass('open');
             $(this).parent().parent().parent().addClass('open');

             // See if it's a section link (not a category link)
             var sectLink = $(this).parent().attr('data-sect-id');

             if (typeof sectLink !== typeof undefined && sectLink !== false) {
               $(this).parent().find('> .article-sub-menu').addClass('open');
             }

             // Scroll to top of top of the selection
             $('html, body').animate({
               scrollTop: $(this).parent().parent().offset().top - 120
             }, 600);

           } // End if has open

           // Remove any empty sections
           $('.cat-menu-list').each(function() {
             if ($(this).find('.article-sub-menu').length < 1) {
               $(this).remove();
             }
           });

           $('.section-sub-menu > li').each(function() {
             if ($(this).find('.article-sub-menu').length < 1) {
               $(this).remove();
             }
           });

         });


         // Sub sub menu interactions

         $('#dynamic-menu-container #menu .sub-sub-menu a').not('.article-sub-menu a').on('click', function(e) {

           e.preventDefault();

           // If already open

           if ($(this).parent().hasClass('open')) {
             $(this).parent().removeClass('open');
             $(this).parent().find('> .article-sub-menu').removeClass('open');

           } else {

             // Close all others
             $(this).parent().parent().find('.sub-sub-menu').removeClass('open');
             $(this).parent().parent().find('.sub-sub-menu .article-sub-menu').removeClass('open');


             // Open this one
             $(this).parent().addClass('open');
             $(this).parent().find('> .article-sub-menu').addClass('open');

           }

         });
       }, 1000);
     }

     /* END AFTER INIT INTERACTIONS FUNCTION ------------------------------------------------------ */

     // Load menu for first time

     var myCookie = Cookies.get(cookieTitle);
     console.log(myCookie);

     if (myCookie != 'true') {

       console.log("Cookie is not set");
       loadMenu();

       $(document).ajaxStop(function() {
         afterSectionsLoaded();
         afterMenuLoaded();
       });


     } else {

       // Restore saved Menu cache

       console.log("cookie is set");
       var cachedMenuHTML = $.sessionStorage.getItem(cookieTitle);
       $('#dynamic-menu-container #menu').replaceWith(cachedMenuHTML);

       // If something goes wrong, run it anway
       if (cachedMenuHTML == null) {
         console.log('Something went wrong so loading anyway');
         loadMenu();

         $(document).ajaxStop(function() {
           afterSectionsLoaded();
           afterMenuLoaded();
         });
       }
       console.log("Menu Loaded from Cache");
       afterMenuLoaded();

     }

     // END MENU JS


   } // End if dynamic menu page


 }); // End jQuery Ready
