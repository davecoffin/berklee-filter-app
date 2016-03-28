var bFilter = function() {
  var tag_categories;
  var templates;
  var selectedChoices = {};
  var selectedClassMap = {};
  var tagMap = {};
  var programMap = {};
  var matchingPrograms = [];
  var filter_order = [];
  var iconMap = {
    "level": '<i class="fa fa-graduation-cap"></i>',
    "location": '<i class="fa fa-map-marker"></i>',
    "interest": '<i class="fa fa-hashtag"></i>',
    "instrument": '<i class="fa fa-music"></i>',
    "type": '<i class="fa fa-info-circle"></i>',
    "genre": '<i class="fa fa-headphones"></i>',
    "timing": '<i class="fa fa-clock-o"></i>',
    "language": '<i class="fa fa-globe"></i>',
    "cost": '<i class="fa fa-money"></i>'
  }
  function loadTemplates(url, callBack) {
    var maps = templates ? templates : templates = {};
    url = url.replace(/^https?:/i, document.location. col);
    if (maps[url]) {
      setTimeout(function() { 
        callBack(maps[url]); 
      }, 1); 
    } else {
      var txt = $('bFilter-templates').html();
      maps[url] = {};
      var pairs = txt.split(/<!--%\s*/);
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].match(/([^\s]+)\s*%-->\s*([\s\S]*)/)) maps[url][RegExp.$1] = RegExp.$2;
      }
      $('bFilter-templates').remove();
      callBack(maps[url]);
    }
  }
  
  function getParams() {
    var vars = {}, hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }

    return vars;
  }
  
  function populateTagCategories() {
    $('#bFilter-options').html('');
    for (var i = 0; filter_order.length > i; i++) {
      var option = $(templates.bOption);
      option.find('span').html((iconMap[filter_order[i]] ? iconMap[filter_order[i]] + '&nbsp;' : '') + filter_order[i] + ' <i class="directional fa fa-chevron-right"></i>');
      option.data('choices', tag_categories[filter_order[i]]);
      option.data('category', filter_order[i]);
      $('#bFilter-options').append(option);
    }
        
    $('.bOption span').click(function(e) {
      e.preventDefault();
      showChoices($(this).closest('.bOption'));
      
    });
  }
  
  function showChoices(selectedElement) {
    function hideChoices() {
      selectedElement.find('i.directional').removeClass('fa-chevron-down').addClass('fa-chevron-right');
      $('.bOption-overlay').slideUp(200, function() {
        $(this).remove();
      });
    }
    
    if (selectedElement.find('.bOption-overlay').length) {
      hideChoices();
    } else {
      var choices = selectedElement.data('choices');
      $('.bOption-overlay').each(function() {
        $(this).remove();
      });
      selectedElement.append(templates.bOption_overlay);
      for (var i = 0; choices.length > i; i++) {
        var choice = $(templates.filter_input);
        choice.find('label').data('choice', choices[i]).attr('data-id', choices[i].id).append(choices[i].value);
        
        $('.bOption-overlay').append(choice);
      }
      $('.bOption-overlay').append(templates.close_filter_overlay);
      $('.bOption-overlay').slideDown(200);
      selectedElement.find('i.directional').removeClass('fa-chevron-right').addClass('fa-chevron-down');
      
      $('.bOption-overlay label input').change(function() {
        if ($(this).is(':checked')) {
          selectFilter($(this).closest('label').data('choice'), $(this).closest('.bOption').data('category'));
          $(this).closest('label').addClass('selected');
        } else {
          removeFilter($(this).closest('label').data('choice'), $(this).closest('.bOption').data('category'));
          $(this).closest('label').removeClass('selected');
        }
        showAvailableTags();
      });
      
      updateUI();
      
      // disable checkboxes that will produce no results.
      showAvailableTags();
      
      $('.close_filter_overlay').click(function() {
        hideChoices();
      });
      
      $(document).bind('click.hideResults', function(event) {
        if (event.isDefaultPrevented()) return;
        var clickedInside = false;
        if ($('.bOption-overlay').is(event.target)) {
          clickedInside = true;
        } else {
          $('.bOption-overlay').find('*').each(function() {
            if ($(this).is(event.target)) {
              clickedInside = true;
            }
          });
        }
        if (!clickedInside) {
          hideChoices();
          $(document).unbind('.hideOverlay');
        }
      });
      
      $(document).bind('keydown.keyHideOverlay', function(event) {
        if (event && event.keyCode && event.keyCode == 27) {
          var clickedInside = false;
          if ($('.bOption-overlay').is(event.target)) {
            clickedInside = true;
          } else {
            $('.bOption-overlay').find('*').each(function() {
              if ($(this).is(event.target)) {
                clickedInside = true;
              }
            });
          }
          if (!clickedInside) {
            hideChoices();
            $(document).unbind('.keyHideOverlay');
          }
        } 
      });
    }
  }
  
  function showAvailableTags() {
    $('.bOption-overlay label').each(function() {
      var choice = $(this).data('choice');
      var category = $(this).closest('.bOption').data('category');
      choice.category = category;
      console.log(choice);
      var potentialString = buildClassNames(choice);
      if (!$(potentialString).length) {
        $(this).find('input').attr('disabled', 'disabled');
        $(this).addClass('unavailable');
      }
    })
  }
    
  function selectFilter(filter, category) {
    // this is where you reorganize everything.
    filter.category = category;
    selectedChoices[filter.id] = filter;
    if (!selectedClassMap[filter.category]) selectedClassMap[filter.category] = [];
    selectedClassMap[filter.category].push('.' + category + '-' + filter.id);
    updateUI();
  }
  
  function removeFilter(filter, category) {
    delete selectedChoices[filter.id];
    
    for (var i = 0; selectedClassMap[category].length > i; i++) {
      if (selectedClassMap[category][i] == '.' + category + '-' + filter.id) {
        selectedClassMap[category].splice(i, 1);
      }
    }
    updateUI();
  }
  
  function buildClassNames(extra) {
    // extra is another class you can pass to determine if that tag will yield any results combined with selected.
    if (extra) {
      var tempSelectedClassMap = $.extend(true, {}, selectedClassMap);
      if (!tempSelectedClassMap[extra.category]) tempSelectedClassMap[extra.category] = [];
      tempSelectedClassMap[extra.category].push('.' + extra.category + '-' + extra.id);

      var groups = [];
      for (x in tempSelectedClassMap) {
        if (tempSelectedClassMap[x].length) groups.push(tempSelectedClassMap[x])
      }
      var all_filters = [];
      fyp_build_filter("",groups,all_filters);
      all_filters = all_filters.join(', ');
      return all_filters;
    } else {
      var groups = [];
      for (x in selectedClassMap) {
        if (selectedClassMap[x].length) groups.push(selectedClassMap[x])
      }
      var all_filters = [];
      fyp_build_filter("",groups,all_filters);
      all_filters = all_filters.join(', ');
      return all_filters;
    }
    // Here we are turning selectedClassMap into a simple array so we 
    // can utilize Joe's already built function to build class names.
    
    
    function fyp_build_filter(build_str,components,filters) {
      // Thanks Joe!
      if (components.length === 0) {
        filters.push(build_str);
        return;
      }
      for (var i = 0; i < components[0].length; ++i) {
        fyp_build_filter(build_str+components[0][i], components.slice(1), filters);
      }
    }
  }
  
  function appendTagTable() {
    var choiceMap = {};
    for (var sc in selectedChoices) {
      if (!choiceMap[selectedChoices[sc].category]) choiceMap[selectedChoices[sc].category] = [];
      choiceMap[selectedChoices[sc].category].push(selectedChoices[sc]);
    }
    
    $('.bResult table').html('');
    
    $('.bResult').each(function() {
      var id = $(this).attr('data-id');
      var program = programMap[id];
      if (program.levels) {
        $('table', $(this)).append('<tr><td class="value">' + program.levels.replace(/\|\|/g, ', ') + '</td></tr>');
      }
      if (program.locations) $('table', $(this)).append('<tr><td class="value">' + program.locations.replace(/\|\|/g, ', ') + '</td></tr>');
      for (choice in choiceMap) {
        if (choice != 'level' && choice != 'location' && choiceMap[choice].length > 1) {
          $('table', $(this)).append('<tr><td class="value">' + program[choice+'s'].replace(/\|\|/g, ', ') + '</td></tr>');
        }
      }
    });
  }
  
  function updateUI() {
    $('input[type="checkbox"]').each(function() {
      $(this).attr('checked', false);
    });
    
    $('.bOption').each(function() {
      $(this).removeClass('selected');
      var hasChoiceApplied = false;
      var choices = $(this).data('choices');
      for (var c in selectedChoices) {
        for (var i = 0; choices.length > i; i++) {
          if (selectedChoices[c].id == choices[i].id) {
            $(this).addClass('selected');
          }
        }
      }
    });
    var currentHeight = $('#bFilter-applied').outerHeight(true);
    $('#bFilter-applied').css('height', currentHeight).html('');
    
    
    appendTagTable();
    var loc = window.location.pathname
    if (window.history && window.history.replaceState) window.history.replaceState("object or string", "", loc);
    
    var classString = '.bResult';
    var idString = '';
    if (!$.isEmptyObject(selectedChoices)) {    
      classString = buildClassNames();
      for (var i in selectedChoices) {
        // check the boxes if they are visible.
        if ($('.bOption-overlay label[data-id="' + i + '"]').length) {
          $('.bOption-overlay label[data-id="' + i + '"]').find('input').attr('checked', true);
        }
        
        // build the ID string for the URL.
        idString += selectedChoices[i].id + ',';
        
        var tag = $(templates.bTag);
        tag.attr('data-id', selectedChoices[i].id);
        tag.data('selectedChoice', selectedChoices[i]);
        tag.append(selectedChoices[i].value);
        $('#bFilter-applied').append(tag);
        $('.bTag i').unbind().click(function() {
          var selectedChoice = $(this).closest('.bTag').data('selectedChoice');
          removeFilter(selectedChoice, selectedChoice.category);
        });
      }
      $('#bFilter-applied').css('height', '');
      
      // update the url
      idString = idString.substring(0, idString.length - 1);
      console.log(idString);
      var loc = window.location.pathname
      if (window.history && window.history.replaceState) window.history.replaceState("object or string", "", loc + "?filter=" + idString);

      
      $('#bFilter-applied').append(templates.clear_all_tags);
      $('.clear_all').click(function() {
        selectedChoices = {};
        selectedClassMap = {};
        updateUI();
      })
    } else {
      $('#bFilter-applied').css('height', '');
    }
    
    // update the grid
    $('#bFilter-results').isotope({
      filter: classString
    });

    $('#no_results').remove();
    if (!$('#bFilter-results').data('isotope').filteredItems.length) {
      $('#bFilter-results').after(templates.no_results);
    }
      
  }
  
  function initUI() {
    loadAll();
    var $container = $('#bFilter-results');
    $container.isotope({
      itemSelector: '.bResult',
      filter: '.bResult',
      resizable: false,
    });
    
    var params = getParams();
    if (params.filter) {
      ids = params.filter.split(',');
      for (var i = 0; ids.length > i; i++) {
        for (var t in tag_categories) {
          for (var tc = 0; tag_categories[t].length > tc; tc++) {
            if (ids[i] == tag_categories[t][tc].id) {
              selectFilter(tag_categories[t][tc], t);
            }
          }
        }
      }
    }
    
    $('.mobile_filter_btn').unbind().click(function() {
      if ($('#bFilter-options').css('display') != 'block') {
        $('#bFilter-options').slideDown(function() {
          $(this).css('overflow', '');
        });
      }
      $('html, body').animate({
          scrollTop: $('.mobile_filter_btn_position').offset().top
      }, 100, function() {
        $(window).scroll();
      });
    })
        
    $(window).scroll(function () {
      if ($('.mobile_filter_btn').css('display') == 'block' && $(window).width() < 551) {
        var eTop = $('.mobile_filter_btn_position').offset().top; //get the offset top of the element
        var pos = eTop - $(window).scrollTop();
        if (pos < 1) {
          var height = $('.mobile_filter_btn').outerHeight(true);
          $('.mobile_filter_btn_position').css('height', height);
          $('.mobile_filter_btn').addClass('fixed');
        } else {
          $('.mobile_filter_btn').removeClass('fixed');
          $('.mobile_filter_btn_position').css('height', '');
        }
        
        var resultsTop = $('#bFilter-results').offset().top;
        var resultsPos = resultsTop - $(window).scrollTop();
      }
    });
    $(window).scroll();
  }

  
  function displayButton(element) {
    $('.program_title', element).animate({
      marginTop: '0px',
      paddingBottom: '30px'
    });
    $('.link_holder', element).show().css('bottom', '5px').css('opacity', 0).animate({opacity: 1, bottom: -5+'px'});
    $('.bResult-image', element).animate({width: '103%', height: '103%'});
  }
  
  function hideButton(element) {
    $('.program_title', element).animate({
      marginTop: '30px',
      paddingBottom: '0px'
    });
    $('.link_holder', element).show().animate({opacity: 0, bottom: 5+'px'}, function() {
      $(this).hide().css('opacity', '').css('bottom', '')
    });
    $('.bResult-image', element).animate({width: '100%', height: '100%'});
    
  } 
  
  function loadAll() {
    $('#bFilter-results').hide().html('');
    for (var i = 0; matchingPrograms.length > i; i++) {
      programMap[matchingPrograms[i].nid] = matchingPrograms[i];
      var p = matchingPrograms[i];
      var result = $(templates.bResult);
      result.find('.bResult-image').css('background-image', 'url("' + (p.field_grid_image == "/logo.png" ? 'logo.png' : p.field_grid_image) + '")')
      if (p.display_group != 'Misc') result.find('.display_group').text(p.display_group);
      result.find('.title').text(p.title);
//      result.find('.view_link').attr('href', p.path);
      
      for (var t in p) {
        var key = t.split('_');
        if (key[1] == 'tids' && p[t] != "") {
          var ids = p[t].split(',');
          for (var x = 0; ids.length > x; x++) {
            result.addClass(key[0] + '-' + ids[x]);
          }
        }
      }
      result.attr('data-id', p.nid);
      result.find('.block_link').attr('href', p.path);
      $('#bFilter-results').append(result);
      $('#bFilter-results').show();
    }
    
    $('.bResult').mouseenter(function() {
      displayButton($(this));
    });
    $('.bResult').mouseleave(function() {
      hideButton($(this));
    });

    appendTagTable();
  }
  
  return {
    init: function(data) {
      loadTemplates('templates.php', function(loadedTemplates) {
        templates = loadedTemplates;
        $('#bFilter-container').html(templates.scaffolding);
        tag_categories = data.tag_categories;
        filter_order = data.filter_order;
        for (i in tag_categories) {
          for (var t = 0; tag_categories[i].length > t; t++) {
            tagMap[tag_categories[i][t].id] = tag_categories[i][t].value;
          }
        }
        
        populateTagCategories();
        
        matchingPrograms = data.programs;
        initUI();
        
      });
    }
  }
}