Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    name: 'home',
    template: 'home'
});

Router.route('/login');

Router.route('/register');

Router.route('/campaign/:_id', {
    template: 'campaignPage',
    data: function(){
        var currentCampaign = this.params._id;
        return Campaigns.findOne({ _id: currentCampaign });
    }
});