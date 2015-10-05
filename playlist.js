videoStore = new FS.Collection("videoFiles", {
  stores: [
    new FS.Store.FileSystem("videoFiles")
  ]
});

Campaigns = new Meteor.Collection('campaigns');

Videos = new Meteor.Collection('videos');

if (Meteor.isClient) {
  Template.addCampaign.events({
    'submit form': function(event){
      event.preventDefault();
      var campaignName = $('[name=campaignName]').val();
      Campaigns.insert({
          name: campaignName
      });
      $('[name=campaignName]').val('');
    }
  });

  Template.campaigns.helpers({
    'campaign': function(){
        return Campaigns.find({}, {sort: {name: 1}});
    }
  });

  Template.videos.helpers({
    'videos': function() {
      var currentCampaign = this._id;
      var videos = Videos.find({campaignId: currentCampaign});
      var return_val = videos.map(function (v) {return videoStore.findOne({_id: v["file_id"]})});
      return return_val;
    },
    'first_video': function() {
      var currentCampaign = this._id;
      return Videos.findOne({campaignId: currentCampaign});
    }
  });

  Template.add_videos.events({
    'change .file_input': function(event) {
      var currentCampaign = this._id;
      FS.Utility.eachFile(event, function(file) {
        var file_obj = videoStore.insert(file);
        Videos.insert({
          campaignId: currentCampaign,
          file_id: file_obj._id
        });
      });
    }
  });

  Template._fs_DeleteButton2.events({
    'click button': function(event, template){
      var file = template.data.fileObj._id;
      var video_id = Videos.findOne({file_id: file})._id;
      Videos.remove(video_id);
    }
  });

  Template.display_videos.helpers({
    'first_video_url': function() {
      return {
        src: videoStore.findOne().url(),
        type: "video/mp4"
      }
    },
    'is_first_video': function() {
      return videoStore.findOne().url() === this.url()
    }
  });

  Template.display_videos.onRendered(function() {
    var video_player = document.getElementById("video_player");
    video = video_player.getElementsByTagName("video")[0],
      video_links = video_player.getElementsByTagName("figcaption")[0],
      source = video.getElementsByTagName("source"),
      link_list = [],
      currentVid = 0,
      allLnks = video_links.children,
      lnkNum = allLnks.length;
    video.removeAttribute("controls");
    video.removeAttribute("poster");

    (function() {
      function playVid(index) {
        video_links.children[index].classList.add("currentvid");
        source[0].src = link_list[index]
        currentVid = index;
        video.load();
        video.play();
      }

      for (var i = 0; i < lnkNum; i++) {
        var filename = allLnks[i].href;
        link_list[i] = filename;
        (function(index) {
          allLnks[i].onclick = function(i) {
            i.preventDefault();
            for (var i = 0; i < lnkNum; i++) {
              allLnks[i].classList.remove("currentvid");
            }
            playVid(index);
          }
        })(i);
      }
      video.addEventListener('ended', function() {
        allLnks[currentVid].classList.remove("currentvid");
        if ((currentVid + 1) >= lnkNum) {
          nextVid = 0
        } else {
          nextVid = currentVid + 1
        }
        playVid(nextVid);
      })

      video.addEventListener('mouseenter', function() {
        video.setAttribute("controls", "true");
      })

      video.addEventListener('mouseleave', function() {
        video.removeAttribute("controls");
      })

      var indexOf = function(needle) {
        if (typeof Array.prototype.indexOf === 'function') {
          indexOf = Array.prototype.indexOf;
        } else {
          indexOf = function(needle) {
            var i = -1,
              index = -1;
            for (i = 0; i < this.length; i++) {
              if (this[i] === needle) {
                index = i;
                break;
              }
            }
            return index;
          };
        }
        return indexOf.call(this, needle);
      };
      
      var focusedLink = document.activeElement;
      index = indexOf.call(allLnks, focusedLink);
    })();
  })
}

if (Meteor.isServer) {
  videoStore.allow({
    'insert': function() {
      return true;
    }
  });
}