var bFilter = function() {
  var tag_categories;
  var templates;
  var selectedChoices = {};
  var tagMap = {};
  var matchingPrograms = [];
  function loadTemplates(url, callBack) {
    var maps = templates ? templates : templates = {};
    url = url.replace(/^https?:/i, document.location. col);
    if (maps[url]) {
      setTimeout(function() { 
        callBack(maps[url]); 
      }, 1); 
    } else {
      $.get(url, function(txt) {
        maps[url] = {};
        var pairs = txt.split(/<!--%\s*/);
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].match(/([^\s]+)\s*%-->\s*([\s\S]*)/)) maps[url][RegExp.$1] = RegExp.$2;
        }
        callBack(maps[url]);
      });
    }
  }
  
  function populateTagCategories() {
    console.log(templates);
    $('#bFilter-options').html('');
    for (var i in tag_categories) {
      if (i != 'display_group') {              
        var option = $(templates.bOption);
        option.find('span').text(i);
        option.data('choices', tag_categories[i]);
        $('#bFilter-options').append(option);
      }
    }
    
    $('.bOption span').click(function() {
      showChoices($(this).closest('.bOption'));
    });
  }
  
  function showChoices(selectedElement) {
    if (selectedElement.find('.bOption-overlay').length) {
      $('.bOption-overlay').slideUp(200, function() {
        $(this).remove();
      });
    } else {
      var choices = selectedElement.data('choices');
      $('.bOption-overlay').each(function() {
        $(this).remove();
      });
      selectedElement.append(templates.bOption_overlay);
      for (var i = 0; choices.length > i; i++) {
        var choice = $(templates.filter_input);
        choice.find('label').data('choice', choices[i]).attr('data-id', choices[i].id).append(choices[i].value);
//         if (selectedChoices[choices[i].id]) choice.find('input').attr('checked', 'checked');
        $('.bOption-overlay').append(choice);
      }
      $('.bOption-overlay').append(templates.close_filter_overlay);
      $('.bOption-overlay').slideDown(200);
      
      $('.bOption-overlay label input').change(function() {
        if ($(this).is(':checked')) {
          selectFilter($(this).closest('label').data('choice'));
        } else {
          removeFilter($(this).closest('label').data('choice'));
        }
        
      });
      
      updateUI();
      
      $('.close_filter_overlay').click(function() {
        $(this).closest('.bOption-overlay').slideUp(200, function() {
          $(this).remove();
        });
      });
    }
  }
  
  function selectFilter(filter) {
    // this is where you reorganize everything.
    selectedChoices[filter.id] = filter;
    updateUI();
  }
  
  function removeFilter(filter) {
    delete selectedChoices[filter.id];
    updateUI();
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
    $('#bFilter-applied').html('')
    if (!$.isEmptyObject(selectedChoices)) {
      var classString = '';
      
      // here we are going to setup strings for each category appended with a comma so that categories are filtered with an AND statement,
      // and different categories are filtered with OR.
      var categoryStrings = [];
      for (var i in selectedChoices) {
        classString += '.' + selectedChoices[i].category + '-' + i;
        categoryStrings[selectedChoices[i].category] += '.' + selectedChoices[i].category + '-' + i + ', ';
        // check the boxes if they are visible.
        if ($('.bOption-overlay label[data-id="' + i + '"]').length) {
          $('.bOption-overlay label[data-id="' + i + '"]').find('input').attr('checked', true);
        }
        var tag = $(templates.bTag);
        tag.append(selectedChoices[i].value);
        $('#bFilter-applied').append(tag);
      }
      var filterString = '';
      for (var cs in categoryStrings) {
        var catString = categoryStrings[cs].substring(0, categoryStrings[cs].length - 2);
        filterString += catString;
      }
      
      console.log(classString);
      $('#bFilter-applied').append(templates.clear_all_tags);
      $('.clear_all').click(function() {
        selectedChoices = {};
        updateUI();
      })
    }
    
    // update the grid
    $('#bFilter-results').isotope({
      filter: classString
    });
  }
  
  function scrollAppliedTagTable() {
    $('.filter_results_holder').each(function() {
      if ($('table', this).outerHeight() > $(this).outerHeight()) {
        var filterTable = $(this);
        var filterTablePosition = filterTable.offset();
        $(this).mousemove(function(e) {
          var mousePosition = e.pageY - filterTablePosition.top
          console.log(mousePosition);
          var scrollPos = $('table', filterTable).outerHeight() - mousePosition;
          var maxTopScroll = $('table', filterTable).outerHeight() - filterTable.outerHeight();
          
          if (mousePosition < maxTopScroll) {
            $('table', filterTable).css('top', '-' + mousePosition + 'px');
          }
          
        });
      }
    })
  }
  
  function displayAllPrograms() {
    $('#bFilter-results').html('');
    for (var i = 0; matchingPrograms.length > i; i++) {
      var p = matchingPrograms[i];
      var result = $(templates.bResult);
      result.find('.bResult-image').css('background-image', 'url("' + (p.field_grid_image == "/logo.png" ? 'logo.png' : p.field_grid_image) + '")')
      result.find('.display_group').text(p.display_group);
      result.find('.program_title span').text(p.title);
      for (var t in p) {
        var key = t.split('_');
        if (key[1] == 'tids' && p[t] != "") {
          var ids = p[t].split(',');
          for (var x = 0; ids.length > x; x++) {
            result.addClass(key[0] + '-' + ids[x]);
          }
        }
      }
      $('#bFilter-results').append(result);
    }
    
    $('#bFilter-results').isotope({
      itemSelector: '.bResult',
      layoutMode: 'fitRows'
    });
  }
  
  return {
    init: function() {
      loadTemplates('templates.php', function(loadedTemplates) {
        templates = loadedTemplates;
        
        //assigning random ids, delete this! **************************************************
        for (var xx in tagCats) {
          for (var pp = 0; tagCats[xx].length > pp; pp++) {
            var name = tagCats[xx][pp];
            var id = Math.floor((Math.random() * 100000) + 1);
            if (name == "Performance") id = "210696";
            if (name == "English") id = "210821";
            if (name == "Brass") id = "210731";
            if (name == "Undergraduate") id = "210511";
            if (name == "Boston") id = "210531";
            if (name == "Academic year") id = "210801";
            if (name == "In person") id = "210496";
            if (name == "Cost associated") id = "210846";
            if (name == "Engineering") id = "210631";
            if (name == "Production") id = "210701";
            if (name == "Certificate") id = "210521";
            if (xx == "location" && name == "Online") id = "210586";
            if (xx == "type" && name == "Online") id = "210491";
            if (name == "Quarterly") id = "210806";
            if (name == "Composition") id = "210611";
            
            tagCats[xx][pp] = {
              "value": name,
              "id": id,
              "category": xx
            }
          }
        }
        //assigning random ids, delete this! **************************************************


        tag_categories = window.tagCats;
        for (i in tag_categories) {
          for (var t = 0; tag_categories[i].length > t; t++) {
            tagMap[tag_categories[i][t].id] = tag_categories[i][t].value;
          }
        }
        
        console.log(tagMap);
        
        populateTagCategories();
        console.log(tag_categories);
        
        matchingPrograms = programs;
        displayAllPrograms();
        
        // this call should go in the function that populates result blocks
        scrollAppliedTagTable();
      });
    }
  }
}