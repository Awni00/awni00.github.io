$(document).ready(function() {
  // add toggle functionality to abstract, bibtex, and tldr buttons
  $('a.abstract').click(function() {
    $(this).parent().parent().find('.abstract.hidden').toggleClass('open');
    $(this).parent().parent().find('.bibtex.hidden.open').removeClass('open');
    $(this).parent().parent().find('.tldr.hidden.open').removeClass('open');
  });
  $('a.bibtex').click(function() {
    $(this).parent().parent().find('.bibtex.hidden').toggleClass('open');
    $(this).parent().parent().find('.abstract.hidden.open').removeClass('open');
    $(this).parent().parent().find('.tldr.hidden.open').removeClass('open');
  });
  $('a.tldr').click(function() {
    $(this).parent().parent().find('.tldr.hidden').toggleClass('open');
    $(this).parent().parent().find('.abstract.hidden.open').removeClass('open');
    $(this).parent().parent().find('.bibtex.hidden.open').removeClass('open');
  });
  $('a').removeClass('waves-effect waves-light');

  // bootstrap-toc
  if($('#toc-sidebar').length){
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href  = "../css/jupyter.css";
  cssLink.rel   = "stylesheet";
  cssLink.type  = "text/css";

  let theme = localStorage.getItem("theme");
  if (theme == null || theme == "null") {
    const userPref = window.matchMedia;
    if (userPref && userPref("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
  }

  $('.jupyter-notebook-iframe-container iframe').each(function() {
    $(this).contents().find("head").append(cssLink);

    if (theme == "dark") {
      $(this).bind("load",function(){
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark"});
      });
    }
  });
});

