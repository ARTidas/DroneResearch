$(document).ready(function() {
    
    // Menu animation
    $('#menu div > div').hide();
    $('#menu div').hover(
        function() {
            $(this).find('div').stop().slideDown('fast');
        },
        function() {
            $(this).find('div').stop().slideUp('fast');
        }
    );

});