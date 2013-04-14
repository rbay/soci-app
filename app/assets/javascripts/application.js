// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

var currentUser;
var retweeted;
var tweetsPerPage = 10;

$.getJSON("timeline", function (tweets) {
    if (tweets.error){
        $('p#more-tibs, #spinner').hide();
        $('.row').html('<p style="text-align: center;">Something went wrong. Please try again later.</p>')
    }else{
        if (tweets.user.attrs){
            currentUser = tweets.user.attrs;
        }

        $.each(tweets.timeline, function (i, tweet) {
            if (tweet.error) {
                $('.loading').remove();
                $('#search-response').html(data.error);
            }
            else{
                $('.row').append(renderStatus(tweet));
            }
        });
        $(".loading").hide();
        if (tweets.timeline.length < tweetsPerPage) {
            $('.more-tweets').hide();
        }else{
            $('.more-tweets').show();
        }
    }
});

function renderStatus(entry) {
    var streamItem = $("<div class='stream-item' id='" + entry.id_str + "'></div>"),
        streamHeader = $("<div class='stream-header'></div>"),
        profilePic = $(imageLink(entry.user.screen_name, entry.user.profile_image_url_https)),
        nameHolder = $("<span class='pull-left flm'></span>");
    nameHolder.append($(userName(entry.user.name, entry.user.screen_name)));
    nameHolder.append($(userLink(entry.user.screen_name)));
    var tweetText = $("<br/><p class='js-tweet-text flmp'>" + " &nbsp; " + createLinks(entry.text) +  "</p>"),
        actionLinksHolder = $("<ul class='tweet-actions js-actions'>"),
        reply = $("<li><a role='button' class='with-icn js-action-reply' data-modal='tweet-reply' href='#'>Reply</a></li>"),
        retweet = $("<li><a role='button' class='with-icn retweet' data-modal='tweet-retweet' href='#'>Retweet</a></li>"),
        deleteTweet = $("<li><a role='button' class='with-icn js-action-del' href='#'></li>");

    actionLinksHolder.append(reply);
    actionLinksHolder.append(retweet);
    actionLinksHolder.append(deleteTweet);
    actionLinksHolder.append('<li><a href="' + timeStampPermUrl(entry) + '" target="_blank"><span class="time-created">' + jQuery.timeago(new Date(entry.created_at.toString())) + '</span></a></li>');
    streamHeader.append(profilePic);
    streamHeader.append(nameHolder);
    streamItem.append(streamHeader);
    streamItem.append(tweetText);
    streamItem.append(actionLinksHolder);

    return streamItem;
}

function imageLink(userName, imageUrl) {
    return "<a target='_blank' class='pull-left' href='https://www.twitter.com/" + userName + "'> <img class='img-circle' src='" + imageUrl + "'/></a>";
}

function userLink(userName) {
    return "<a target='_blank' href='https://www.twitter.com/" + userName + "'> @" + userName + " </a>";
}

function userName(name, userName){
    return "<a class='active-name'  target='_blank' href='https://www.twitter.com/" + userName + "'> " + name + " </a>";
}

function createLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

    if (text.indexOf("href") != -1)
        return text;
    else
        return text.replace(exp, "<a href='$1' target='_blank' >$1</a>");
}

function timeStampPermUrl(entry) {
    return "https://www.twitter.com/" + entry.user.screen_name + "/status/" + entry.id_str;
}

$('#twitter_form').submit(function(e){
    e.preventDefault();
    $.post ('tweet', $(this).serialize (), function (response){
        if (response.error){

        }else{
            $('.row').prepend(renderStatus(response));
        }
    });
    $(this).find("textarea").val("");
});

//See more tweets
$('.more-tweets').on('click', function () {

    morePosts(currentUser, $('.row div.stream-item:last').attr('id'));
    return false;
});

$('#searchForm').submit(function (e) {
    e.preventDefault();
    $.get ('search', {count: tweetsPerPage, q: $('#search_str').val()}, function (tweets){
        $.each(tweets.statuses, function (i, tweet) {
            if (tweet.error) {
                $('.row').html(data.error);
            }else if (tweet.retweeted)
            {}
            else{
                $('.row').append(renderStatus(tweet));
            }
        });
        if (tweets.statuses.length < tweetsPerPage) {
            $('.more-tweets').hide();
        }else{
            $('.more-tweets').show();
        }
    });
});

function morePosts(currentUser, sinceId) {
    $.get ('more_tweets', {count: tweetsPerPage, max_id: sinceId}, function (tweets){
        $.each(tweets, function (i, tweet) {
            if (tweet.error) {
                $('#search-response').html(data.error);
            }
            else{
                $('.row').append(renderStatus(tweet));

            }
        });
        if (tweets.length < tweetsPerPage) {
            $('.more-tweets').hide();
        }
    });
}
