# Dynamic Menu Starter Kit


## Pre-Reqs
Add to `footer.hbs`

**jQuery**
https://code.jquery.com/

**JQuery Cookies**

    <script type="text/javascript" src="{{asset 'jquery.cookies.js'}}"></script>

**HTML5 Local storage**

    <script type="text/javascript" src="{{asset 'jquery.html5storage.min.js'}}"></script>

**Dynamic Menu Script** 

    <script type="text/javascript" src="{{asset 'dynamic-menu.js'}}"></script>


## HTML to add to template
Add to any page that has the menu sidebar

     <div id="dynamic-menu-container"><div id="menu"></div></div>


#### Article PageHTML
Article Page tag for finding current article (can be added to anything on `article_page.hbs`


    data-article-id="{{article.id}}"


## CSS
Add SCSS file to anywhere in the template's css
