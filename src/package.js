$(document).ready(function() 
{
	// get location beforehand
	var longitude;
	var latitude;
	getLocation();

	// generate posts on document load
	generatePosts();

	function getLocation() {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(showPosition, showError);
	    } 
	    else {
	        return false;
	    }
	}

	function showPosition(position) {
	    var latlon = position.coords.latitude + "," + position.coords.longitude;
	     latitude = position.coords.latitude;
	     longitude = position.coords.longitude;

	    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="
	    +latlon+"&zoom=14&size=300x150&sensor=false";

	    latitude = parseFloat(position.coords.latitude);
            longitude = parseFloat(position.coords.longitude)

	}

	function showError(error) {
	    switch(error.code) {
	        case error.PERMISSION_DENIED:
	            return false
	            break;
	        case error.POSITION_UNAVAILABLE:
	            return false
	            break;
	        case error.TIMEOUT:
	            return false
	            break;
	        case error.UNKNOWN_ERROR:
	            return false
	            break;
	    }
	}


	function generatePosts()
	{
        $.getJSON('posts.json', function(data) 
        {
			var dest = $('ul#reviews').attr('data');
        	$('ul#reviews').empty();

		    $.each(data.posts, function(key, val) 
		    {
		    	if (val.dest_id == dest) 
		    	{
					// create postHTML html with unique id
					postHTML = '<li id="' + val.id + '">';
					postHTML += '<div class="location"><div class="yeah" id="map_' + val.id + '"></div></div>';
					postHTML += '<div class="review_left"><span class="float_right"><a class="post_delete" href="javascript: return false;"><i class="fa fa-times"></i></a> #' + val.id + '</span>';
					postHTML += '<div><strong>' + val.name + '</strong> <span class="user_identity">(' + val.identity + ')</span></div>';

					postHTML += '<div class="rating">';

					for (i = 0; i < val.rating; i++)
					{
						postHTML += '<i class="fa fa-star"></i>'; 
					}
					for (i = val.rating; i < 5; i++)
					{
						postHTML += '<i class="fa fa-star-o"></i>'; 
					}

					postHTML += '</div>';

					if (val.post != '') // not empty
					{
							postHTML += '<blockquote>' + val.post;
							if (val.reply != '')
							{
								postHTML += '<blockquote><strong>' + val.replyName + '</strong> (Management): ' + val.reply + '</blockquote>';
							}
							postHTML += '</blockquote>';
					}

					postHTML += '</div></li>';

					postHTML += '<div id="map_'+val.id+'"></div>';

					$('ul#reviews').prepend(postHTML);

					var mapID = 'map_' + val.id; 
					initMap(val.latitude, val.longitude, mapID);
				}
		    });

		    $('ul#deleted_reviews').empty();
		    $.each(data.posts_deleted, function(key, val) 
		    {
		    	if (val.dest_id == dest)
		    	{
					// create postHTML html with unique id
					postHTML = '<li id="' + val.id + '">';
					postHTML += '<span class="float_right"><a class="post_delete" href="javascript: return false;"><i class="fa fa-times"></i></a> #' + val.id + '</span>';
					postHTML += '<div><strong>' + val.name + '</strong> <span class="user_identity">(' + val.identity + ')</span></div>';

					postHTML += '<div class="rating">';

					for (i = 0; i < val.rating; i++)
					{
						postHTML += '<i class="fa fa-star"></i>'; 
					}
					for (i = val.rating; i < 5; i++)
					{
						postHTML += '<i class="fa fa-star-o"></i>'; 
					}

					postHTML += '</div>';

					if (val.post != '') // not empty
					{
							postHTML += '<blockquote>' + val.post + '</blockquote>';
					}

					postHTML += '</li>';

					$('ul#deleted_reviews').append(postHTML);
				}
		    });

	    });
	}

	// submit form and call create post function
	$(document).on('submit', '#post_reply', function(e)
	{
		e.preventDefault();
		var dest = $('ul#reviews').attr('data');
		var user_name = $('#user_name').val();
		var user_identity = $('#user_identity').val();
		var rating = $('#rating_value input[type=radio]:checked').val();
		var post_content = $('#message').val();
		var user_latitude = latitude;
		var user_longitude = longitude;

		if (user_identity != 'Hotel Manager')
		{
			if (user_name == '')
			{
				popup('You need to specify a name.', false);
				return false;
			}
			else 
			{
		        $.getJSON('posts.json', function(data) 
		        {
					data.posts.push(
					    {'id': data.posts.length, 'dest_id': dest, 'name': user_name, 'identity': user_identity, 'rating': rating, 'post': post_content, 'latitude': user_latitude, 'longitude': user_longitude, 'reply': "", 'replyName': ""}
					);

				    $.ajax({
						type: 'POST',
						dataType: "json",
						data: JSON.stringify(data, null, 2),
						contentType: "application/json"
				    });
				popup('Review Posted.', false)
			    });
				setTimeout(function(){
					generatePosts();
				}, 500); 
				$('#post_reply')[0].reset();
			}
		}
		else {
			if (user_name == '')
			{
				popup('You need to specify a name.', false);
				return false;
			}
			else 
			{
				var post_reply_id = $('#posts_listing select').val();

		        $.getJSON('posts.json', function(data) 
		        {
		        	data.posts[post_reply_id].replyName = user_name;
		        	data.posts[post_reply_id].reply = post_content;

				    $.ajax({
				        type: 'POST',
				        data: JSON.stringify(data, null, 2)
				    });
			    });
				setTimeout(function(){
					generatePosts();
				}, 500); 
				$('#post_reply')[0].reset();
			}
		}
		return false;
	});


	// delete post
	$(document).on('click', 'a.post_delete', function(e) 
	{
		var post_id = $(this).parent().parent().parent('li').attr('id');

        $.getJSON('posts.json', function(data) 
        {
		    $.each(data.posts, function(key, val) 
		    {
				if(post_id == val.id)
				{
					data.posts_deleted.push(data.posts[key]);
					data.posts.splice(key, 1);
					return false;
				}
		    });

		    $.ajax({
				type: 'POST',
				dataType: "json",
				data: JSON.stringify(data, null, 2),
				contentType: "application/json"
		    });
	    });
		setTimeout(function(){
			generatePosts();
		}, 500); 
		popup('Post has been deleted.', false);
	});


	// change user identity
	$(document).on('change', '#user_identity', function(e)
	{
		var dest = $('ul#reviews').attr('data');
		if ($(this).val() == 'Hotel Manager')
		{
			$('#rating_value').hide();
	        $.getJSON('posts.json', function(data) 
	        {
				for (var i = 0; i < data.posts.length; i++)
				{
					if (data.posts[i].dest_id == dest && data.posts[i].post != "")
					{
						$('#posts_listing select').append('<option value=' + data.posts[i].id + '>' + data.posts[i].name + ' (Post ' + data.posts[i].id + ')</option>');
					}
				}
				$('#posts_listing').css('display', 'inline-block');

		    });

		}
		else {
			$('#rating_value').show();
			$('#posts_listing').hide();
			$('#posts_listing select option').remove();
		}
	});


	// change destination option
	$(document).on('change', '#destination_listing', function(e)
	{
		var dest = $(this).val();
		$('#date_listing, #time_listing').empty();

        $.getJSON('posts.json', function(data) 
        {
		    $.each(data.sessions, function(key, val) 
		    {
				if(dest == val.dest_id)
				{
					$('#date_listing').append('<option value="' + val.date + '">' + val.date + '</option>');
					$('#time_listing').append('<option value="' + val.time + '">' + val.time + '</option>');
				}
		    });
	    });
	});

	// submit booking
	$(document).on('submit', '#book_trip', function(e)
	{
		e.preventDefault();

		var ref = generateReference();
		var dest = $('#destination_listing').val();
		var date = $('#date_listing').val();
		var time = $('#time_listing').val();
		var firstName = $('#firstName').val();
		var lastName = $('#lastName').val();
		var partySize = $('#party_size').val();
		var sData = ''

        $.getJSON('posts.json', function(data) 
        {
			data.bookings.push(
				{"book_id": data.bookings.length, "ref": ref, "dest": dest, "date": date, "time": time, "firstName": firstName, "lastName": lastName, "partySize": partySize}
			);

		    $.ajax({
				type: 'POST',
				dataType: "json",
				data: JSON.stringify(data, null, 2),
				contentType: "application/json",
				cache: false,
		    });
			popup('Your trip has been booked, here is your reference number: <strong>' + ref + '</strong>', true);

	    });

		function generateReference()
		{
		    var text = "";
		    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

		    for(var i=0; i < 6; i++) 
		    {
		    	text += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    return text;
		}

	});

	// search for booking
	$(document).on('submit', '#search', function(e)
	{
		e.preventDefault();
		$('#trip_info').empty();
		var queryString = $('#reference').val();
		var foundBooking = false;

        $.getJSON('posts.json', function(data) 
        {
		    $.each(data.bookings, function(key, val) 
		    {
				if(queryString == val.ref)
				{
					var tripHTML = '<div>Name: <strong>' + val.firstName + ' ' + val.lastName + '</strong></div>';
					tripHTML += '<div>Party Size: ' + val.partySize + '</div>';
					tripHTML += '<div>Destination: ' + val.dest + '</div>';
					tripHTML += '<div>Departure: ' + val.date + ' @ ' + val.time  + '</div>';
					$('#trip_info').append(tripHTML);
					foundBooking = true;
				}
		    });
		    if (foundBooking == false)
		    {
		    	popup('No existing bookings by this reference.');
		    }
	    });

	});



function initMap(latitude, longitude, mapID) {
  var map = new google.maps.Map(document.getElementById(mapID), {
    center: {lat: latitude, lng: longitude},
    zoom: 13
  });
  var marker = new google.maps.Marker({
  	map: map,
  	title: "Location"
  	});

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

     	marker.setPosition(pos);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, marker, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, marker, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, marker, pos) {
  marker.setPosition(pos);
}


	// popup for errors 
	function popup(text, preserve)
	{
		if ( $('.popup').is(':visible') )
		{
			$('.popup').hide();
		}
		$('.popup span').html(text);
		$('.popup').fadeIn(200);

		setTimeout(function(){
			if (preserve == false)
			{
				$('.popup').fadeOut(200);
			}
		}, 3000);
	}

	$(document).on('click', '.popup-close', function() 
	{
		$(this).parent('div').fadeOut(200);
	});


	//global ajax loading functions
	$(document).ajaxStart(function() 
	{
	    $('#loading').show();
	});
	$(document).ajaxStop(function() 
	{
	    $('#loading').delay(200).hide();
	});








});
