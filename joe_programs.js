// Recursively builds filter combinations based on a 2d array
function fyp_build_filter(build_str,components,filters) {
  if(components.length === 0) {
    filters.push(build_str);
    return;
  }
  for(var i = 0; i < components[0].length; ++i) {
    fyp_build_filter(build_str+components[0][i], components.slice(1), filters);
  }
}

// Get selected values as an array from a field
function fyp_get_selected(field_name) {
  return jQuery('#edit-field-'+field_name+'-tags-tid option:selected').
    map(function(){return '.'+field_name+'-'+this.value;}).
    get();
}

jQuery(document).ready(function($){
  $('.views-row-group').each(function(){ $('h3',this).insertBefore(this); });
  var grid = $('.view-display-id-find_your_program .views-row-group');
  var fields = ['level','type','location','interest','instrument','genre','timing','language','cost'];

  var update_selections = function(e) {
    // build a 2d array of selected filters, purge the empty arrays
    var groups = [];
    for(var i=0;i < fields.length;++i) {
      groups.push(fyp_get_selected(fields[i]));
    }
    // filter out the empty arrays
    groups = groups.filter(function(value){ return value.length > 0;});
    // build a single selector from the 2d array
    var all_filters = [];
    fyp_build_filter("",groups,all_filters);
    all_filters = all_filters.join(', ');
    grid.isotope({filter: all_filters});
    // hide empty groups
    $('.views-row-group').each(function() {
      if($(all_filters,this).length === 0 && all_filters.length > 0) {
        $(this).prev().hide();
      } else {
        $(this).prev().show();
      }
    });
  };
  // Attach listeners to all the fields
  var field_ids = [];
  for(var i=0;i < fields.length;++i) {
    field_ids.push('#edit-field-'+fields[i]+'-tags-tid');
  }
  $(field_ids.join(',')).change(update_selections);
  // init isotope
  grid.isotope({
    itemSelector: '.views-row'
  });
});
