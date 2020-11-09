document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // initialize app 
    initializeApp();
    if(window.localStorage.getItem("register") === null ){
        // confirmation for word notification
        var confirmation = confirm("do you want to get a word notification ??");

        // if yes then register the user otherwise don't
        if(confirmation){

            // notification opened callback
            var notificationOpenCB = function(jsonData){
                console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
            };
            
            // initialize the onesignal notification
            window.plugins.OneSignal
                .startInit("f68a5232-0689-4d2e-86a9-c822436e942f")
                .handleNotificationOpened(notificationOpenCB)
                .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
                .endInit();

            // register users player id on server
                registerUser();

            // hide subscribe notification icon
            document.getElementById("subscribe-notification-area").style.display = "none";
        }else{
            // set register as null 
                window.localStorage.setItem("register","no")
            
            // create get word notification enable for  area section
                createEnableWordNotification();
            // get word data;
                getWordData();
        }
    }else{

        if(window.localStorage.getItem("register") == "no"){
            // create get word notification enable for  area section
            createEnableWordNotification();
        }else{
            document.getElementById("subscribe-notification-area").style.display = "none";            
        }
        // get word data
            getWordData(); 
    }
}

// this function is to initialize basic things
function initializeApp(){
    // store API url in localstorage
    window.localStorage.setItem("API_URL","https://kshitijskincare.com/WordifireAPI");    
    // make fav null
    if(window.localStorage.getItem("register") != "yes"){
        localStorage.setItem("fav",null)
    }
}

// function to set external user id as player id on one signal  server
function registerUser(){

    window.plugins.OneSignal.setExternalUserId(device.uuid,function(result){
        // alert(JSON.stringify(result));
        // logic to make loading screen here
        $.get(window.localStorage.getItem("API_URL")+'/RegisterUser.php',{
            player_id: device.uuid
            },function(data){
                var data  = JSON.parse(data);
                if(data.status == 500 || data.status == 404){
                    alert(data.message+" please try again by reopening the app !!");
                    // get word data after register
                    getWordData();
                }else{
                    alert(data.message);
                    window.localStorage.setItem("register","yes");
                    // get word data after register
                    getWordData();
                }
        });
    });
}

// function to create area where user can register for notification
function createEnableWordNotification(){
    document.getElementById("subscribe-notification-area").style.display = "flex";
}

// subscribe for notification
function subscribeForNotification(){
    var confirmation = confirm("subscribe for word notification ?? ");

    if(confirmation){
        document.getElementById("loading-screen").style.display = "flex";                    
        
        // notification opened callback
        var notificationOpenCB = function(jsonData){
            console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
        };
        
        // initialize the onesignal notification
        window.plugins.OneSignal
            .startInit("f68a5232-0689-4d2e-86a9-c822436e942f")
            .handleNotificationOpened(notificationOpenCB)
            .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
            .endInit();

        // register user
        registerUser();

        // hide subscribe notification icon
        document.getElementById("subscribe-notification-area").style.display = "none";

    }else{
        // do nothing
    }
}

// function to get word data from api
function getWordData(){
    $.get('https://kshitijskincare.com/WordifireAPI/ViewWords.php',
    function(data){
        // var data  = JSON.parse(data);
        if(data.status == 204){
            // No words Available
            alert("Sorry no words available at this time....")
        }else if(data.status == 500){
            // database connection error
            alert("database connection error!! please reopen the app")
        }else{
            // pass data to create cards with data
            populateData(data);
            // pass data to fill favourites tab
            populateFavorites(data);
            // console.log(data)
            // remove loading screen
            document.getElementById("loading-screen").style.display = "none";            
        }
    });
}

// function to populate data in card
function populateData(data){
    word = "";
    for (let index = 0; index < data.data.length; index++) {
        var cardColor = getRandomCardColor();
        word +=`
            <div id="card-main"style="padding: 10px;">
                <div class="row">
                    <div class="col s12">
                        <div id="card-sub-main"class="card ${cardColor[0]}">
                            <div class="card-content white-text">
                                <div class="word-date">
                                    <span>${data.data[index].timestamp}</span>
                                    <img onclick="makeFavourite(${data.data[index].id});reloadPage();" src="https://img.icons8.com/ios-filled/25/${(isFav(data.data[index].id))?'212121':'FFFFFF'}/heart.png"/>
                                </div>
                                <span class="card-title">${data.data[index].word}</span>
                                <p class="word-pronounciation-text-audio">
                                    <span>${data.data[index].pronounciation_text}</span>
                                    <span>
                                        <img src="https://img.icons8.com/ios-filled/25/212121/room-sound.png" onclick="playPronounciationSound('pronounciation-audio-player-${data.data[index].id}');"/>
                                    </span>
                                </p>
                                <audio id="pronounciation-audio-player-${data.data[index].id}" style="display: none;"controls>
                                        <source src="${data.data[index].pronounciation_audio}">
                                </audio>
                                <hr>
                                <p class="word-defination" style="color: ${cardColor[1]}; font-weight: bold;">${data.data[index].defination}</p>
                                <div class ="word-extra-info">
                                    <h6 class="word-origin">
                                        <b>Word Origin :</b>
                                        <button class="waves-effect waves-light btn grey darken-4" onclick="showOriginSection(${data.data[index].id});">SEE</button>
                                    </h6>
                                    <hr style="width: 0;min-height: 80px;">
                                    <h6 class="word-example-title">
                                        <b>Example :</b>
                                        <button class="waves-effect waves-light btn grey darken-4" onclick="showExampleSection(${data.data[index].id});">SEE</button>                                                                       
                                    </h6>
                                </div>
                                <div style="display:none;" id="word-origin-section-id"class="word-origin-section-${data.data[index].id}">
                                    <h5><b>WHAT IS THE ORIGIN OF ${data.data[index].word.toUpperCase()}?</b></h5>
                                    <hr>
                                    <p style="color: ${cardColor[1]}; font-weight: bold;">${data.data[index].origin}</p>
                                </div>
                                <div style="display:none;" id="word-example-section-id" class="word-example-section-${data.data[index].id}">
                                    <h5><b>HOW IS ${data.data[index].word} USED?</b></h5>
                                    <hr>
                                    <p style="color: ${cardColor[1]}; font-weight: bold;">${data.data[index].example}</p>
                                    <br>
                                    <p style="margin-left:25px;">- ${data.data[index].example_source}</p>
                                </div>
                                <h6 class="word-podcast"><b>Word Podcast :</b></h6>
                                <p class="word-podcast-player"> 
                                    <audio controls>
                                        <source src="${data.data[index].word_podcast}">
                                    </audio>
                                </p>
                            </div>
                        </div>                            
                    </div>
                </div>
            </div>
        `;
        cardColor = getRandomCardColor();
    }
        // attaching word data in all words
        document.getElementById("AllWords").innerHTML = word;
}

function reloadPage() {
    document.location.reload()
}
// function to check if current card is favourite or not
function isFav(cardId){
    var fav = localStorage.getItem("fav");
    var available = fav.indexOf(cardId);

    if(available>-1){
        return true;
    }else{
        
        return false;
    }
}

// make card favourite
function makeFavourite(cardId){
    var favs = JSON.parse(localStorage.getItem("fav"));
    if(favs!=null){
        var available = favs.indexOf(cardId);

        if(available>-1){
            favs.splice(available,1);
            localStorage.setItem("fav",JSON.stringify(favs));
            return;            
        }else{
            favs.push(cardId);
            localStorage.setItem("fav",JSON.stringify(favs));
            return;
        }
    }else{
        favs = [];
        favs.push(cardId);
        localStorage.setItem("fav",JSON.stringify(favs));
        return;
    }
}
// this function is to play the pronounciation sound
function playPronounciationSound(playerId){
    console.log(playerId);
    document.getElementById(playerId).play();
}
// this function is to show the origin section card 
function showOriginSection(sectionId) {
    console.log(sectionId);
    $(".word-origin-section-"+sectionId).toggle();
    $(".word-example-section-"+sectionId).css("display","none");
}

// this function is to show the example section card
function showExampleSection(sectionId) {
    console.log(sectionId);
    $(".word-example-section-"+sectionId).toggle();
    $(".word-origin-section-"+sectionId).css("display","none");    
}

// card colors
    // 1. blue-grey darken-1 #546e7a
    // 2. purple darken-4 #4a148c
    // 3. red darken-3 #c62828
    // 4. pink darken-1 #d81b60 
    // 5. deep-purple darken-1 #5e35b1
    // 6. indigo darken-3 #283593
    // 7. blue darken-2 #1976d2
    // 8. cyan darken-2 #0097a7
    // 9. teal darken-2 #00796b
    // 10. green darken-2 #388e3c
    // 11. light-green darken-2 #689f38
    // 12. lime darken-4 #827717
    // 13. yellow darken-4 #f57f17 
    // 14. amber darken-4 #ff6f00
    // 15. orange darken-4 #e65100 
    // 16. brown darken-2 #5d4037
    // 17. grey darken-3 #424242
    // 18. blue-grey darken-4 #263238
    // 19. red accent-3 #ff1744

// this function is to get the random color from the array
function getRandomCardColor(){
    var backgroundColorArray = [
        "blue-grey darken-1",
        "purple darken-4",
        "red darken-3",
        "pink darken-1",
        "deep-purple darken-1",
        "indigo darken-3",
        "blue darken-2",
        "cyan darken-2",
        "teal darken-2",
        "green darken-2",
        "light-green darken-2",
        "lime darken-4",
        "yellow darken-4", 
        "amber darken-4",
        "orange darken-4",
        "brown darken-2",
        "grey darken-3",
        "blue-grey darken-4",
        "red accent-3"
    ];
    var fontColorArray = [
        "#546e7a",
        "#4a148c",
        "#c62828",
        "#d81b60",
        "#5e35b1",
        "#283593",
        "#1976d2",
        "#0097a7",
        "#00796b",
        "#388e3c",
        "#689f38",
        "#827717",
        "#f57f17",
        "#ff6f00",
        "#e65100",
        "#5d4037",
        "#424242",
        "#263238",
        "#ff1744"
        ]

    var randomNum = Math.floor(Math.random()*19);

    return [backgroundColorArray[randomNum],fontColorArray[randomNum]];
}

// function is to load favorite word tab
function populateFavorites(data){
    var fav = JSON.parse(localStorage.getItem("fav"));
    var card = "";

    if(fav!=null && fav[0]!=null){
        for (let index = 0; index < fav.length; index++) {
            for (let j = 0; j < data.data.length; j++) {    
                if(fav[index] == data.data[j].id){
                    var cardColor = getRandomCardColor();
                    card += `
                        <div id="card-main"style="padding: 10px;">
                            <div class="row">
                                <div class="col s12">
                                    <div id="card-sub-main"class="card ${cardColor[0]}">
                                        <div class="card-content white-text">
                                            <div class="word-date">
                                                <span>${data.data[j].timestamp}</span>
                                                <img onclick="makeFavourite(${data.data[j].id});reloadPage();" src="https://img.icons8.com/ios-filled/25/${(isFav(data.data[j].id))?'212121':'FFFFFF'}/heart.png"/>
                                            </div>
                                            <span class="card-title">${data.data[j].word}</span>
                                            <p class="word-pronounciation-text-audio">
                                                <span>${data.data[j].pronounciation_text}</span>
                                                <span>
                                                    <img src="https://img.icons8.com/ios-filled/25/212121/room-sound.png" onclick="playPronounciationSound('pronounciation-audio-player-${data.data[j].id}');"/>
                                                </span>
                                            </p>
                                            <audio id="pronounciation-audio-player-${data.data[j].id}" style="display: none;"controls>
                                                    <source src="${data.data[j].pronounciation_audio}">
                                            </audio>
                                            <hr>
                                            <p class="word-defination" style="color: ${cardColor[1]}; font-weight: bold;">${data.data[j].defination}</p>
                                            <div class ="word-extra-info">
                                                <h6 class="word-origin">
                                                    <b>Word Origin :</b>
                                                    <button class="waves-effect waves-light btn grey darken-4" onclick="showOriginSection(${data.data[j].id});">SEE</button>
                                                </h6>
                                                <hr style="width: 0;min-height: 80px;">
                                                <h6 class="word-example-title">
                                                    <b>Example :</b>
                                                    <button class="waves-effect waves-light btn grey darken-4" onclick="showExampleSection(${data.data[j].id});">SEE</button>                                                                       
                                                </h6>
                                            </div>
                                            <div style="display:none;" id="word-origin-section-id"class="word-origin-section-${data.data[j].id}">
                                                <h5><b>WHAT IS THE ORIGIN OF ${data.data[j].word.toUpperCase()}?</b></h5>
                                                <hr>
                                                <p style="color: ${cardColor[1]}; font-weight: bold;">${data.data[j].origin}</p>
                                            </div>
                                            <div style="display:none;" id="word-example-section-id" class="word-example-section-${data.data[j].id}">
                                                <h5><b>HOW IS ${data.data[j].word} USED?</b></h5>
                                                <hr>
                                                <p style="color: ${cardColor[1]}; font-weight: bold;">${data.data[j].example}</p>
                                                <br>
                                                <p style="margin-left:25px;">- ${data.data[j].example_source}</p>
                                            </div>
                                            <h6 class="word-podcast"><b>Word Podcast :</b></h6>
                                            <p class="word-podcast-player"> 
                                                <audio controls>
                                                    <source src="${data.data[j].word_podcast}">
                                                </audio>
                                            </p>
                                        </div>
                                    </div>                            
                                </div>
                            </div>
                        </div>  
                    `;
                    cardColor = getRandomCardColor();
                    console.log(fav[index]);
                    break;
                }            
            }//end of data for
        }// end of fav for

        // add card to favourites
        document.getElementById("Fav").innerHTML = card;        
    }
}