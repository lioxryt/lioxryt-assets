//removes nasty html extension from the URL which could interfere with stuff
if(location.pathname.includes("/index.html")) location.replace(location.pathname.replace('/index.html', '/'))

//basic global stuff
//shortcuts
var content = document.querySelector('#content')
var body = document.body

//flags - story progress, save, etc
var flags = { dialogues: {}, dullvessel_position: 'orbit', detectedEntities: {}}
if(localStorage.getItem('flags') && localStorage.getItem('flags') != "null") {
    flags = JSON.parse(localStorage.getItem('flags'))
}

//local environment
var env = {
    corruStaticBaseVol: 0.4, //base transition volume
    mui: false, //determines whether the mindspike UI is on or not
    dialogues: {}, //dialogues and actors are added to per-page, as needed. this page will not contain them (outside of ones on every page) to avoid spoilers
    entities: {}, //ditto
    cursor: {x:0, y:0}, //fixed coords
    pageCursor: {x:0, y:0}, //page coords
    targeted: [], //used by MUI to cycle targets
    bgm: null,
    dialogueActors: {
        sourceless: {
            type: "sourceless",
        },

        "sourceless quiet": {
            name: "sourceless",
            type: "sourceless",
            voice: false
        },
    
        moth: {
            image: '/img/sprites/moth/mothman.gif',
            type: "external"
        }, 
    
        unknown: {
            image: '/img/sprites/velzie/smile2.png',
            type: "velzie",
            element: "#velzieface",
            voice: ()=>{play('talksignal', 0.5)}
        },
    
        self: {
            image: '/img/portraits/interloper.gif',
            type: "interloper",
            player: true
        },
    
        sys: {
            image: '/img/mui/mindspikelogoactive.gif',
            type: "mindspike",
            player: true,
            voice: ()=>{play('muiScanner', 2)}
        },

        funfriend: {
            element: "#funfriend",
            image: '/img/sprites/funfriend/funfriend.gif',
            type: "obesk funfriend",
            voice: ()=>{play('talk', 2)}
        },

        proxyfriend: {
            element: "#ffproxy",
            image: '/img/sprites/funfriend/proxyfriend.gif',
            type: "obesk funfriend",
            voice: ()=>{play('talkhigh', 1)}
        },

        akizet: {
            image: '/img/sprites/akizet/dith.gif',
            type: "obesk qou akizet",
            element: ".truecreature .akizet",
            player: true,
            voice: ()=>play('talk', 2.5)
        },

        bstrd: {
            image: '/img/sprites/bstrd/bstrd.gif',
            type: "bstrd portrait-cover",
            voice: ()=>play('talkgal', 0.4)
        },
    
        actual_site_error: {
            image: '/img/viendbot.png',
            type: "metafiend portrait-dark portrait-contain",
            voice: ()=>{play('muiClick', 2)}
        },

        bugviend: {
            name: '»õGQàº3¾õ”cR%',
            type: "incoherent thoughtform portrait-blocker hallucination",
            image: "/img/sprites/combat/foes/hallucinations/portrait.gif",
            voice: ()=>play('fear', 2)
        }
    },
    totalMessages: 0,

    stage: {}, //stage stuff - mostly defined per page
    stages: {},
    stageEntities: {
        '.': {slug: '.', class: "blocks"},
        "░": {slug: '░'},//generic movable space
        
        p: { //player spawn point
            contains: {
                slug: 'p',
                id: "creature",
                class: "player ally-sprite",
                type: "player"
            }
        }
    },
		
    timeouts: [],
    setTimeout: (func, time) => {
        let newTimeout = setTimeout(func, time)
        env.timeouts.push(newTimeout)
        return newTimeout
    },
    clearTimeouts: ()=>{
        env.timeouts.forEach(timeout => {
            clearTimeout(timeout)
        });
    },
		
    intervals: [],
    setInterval: (func, time) => {
        let newInterval = setInterval(func, time)
        env.intervals.push(newInterval)
        return newInterval
    },
    clearIntervals: ()=>{
        env.intervals.forEach(interval => {
            clearInterval(interval)
        });
    },

    logStore: [],

    //document-based corru events for modding mostly
    hooks: {
        /*  triggered at the end of each respective event in the page lifecycle
            
            usage i.e. 
                document.addEventListener('corru_loaded', ()=>{
                    console.log(`${page.title} on-load events complete`)
                })

                document.addEventListener('corru_entered', ()=>{
                    console.log(`now entering ${page.title}`)
                })

                document.addEventListener('corru_leaving', ()=>{
                    console.log(`now leaving ${page.title}`)
                })

                document.addEventListener('corru_changed', (ev)=>{
                    const key = ev.detail.key;
                    const value = ev.detail.value;
                })

            can be manually triggered via dispatchEvent, i.e. "document.dispatchEvent(env.hooks.corru_loaded)" 

            the page object is updated periodically, so if you need to preserve it, be sure you do something like 'let currentPage = page' so you have the ref
            here are some useful props
                path: the URL path (i.e. /hub/)
                title: what appears in the browser tab and log when navigating
                name: the title in a short 'slugified' version, (..__LOCALHOST__.. => localhost)
                dialoguePrefix: prefix for dialogue flags that are checked on this page, ("hub" marks flags like so: "hub__funfriend-start")

                ( plus some others not listed since they shouldn't be touched so they aren't listed here sry :-P )
                    P.S. don't modify the page-specific page.flags object directly
                    instead, set via the PAGE!! prefix in change(), i.e. change("PAGE!!somethingOnThisPage", true)
        */

        corru_loaded: new CustomEvent('corru_loaded'), 
        corru_entered: new CustomEvent('corru_entered'),
        corru_leaving: new CustomEvent('corru_leaving'),
        corru_changed: new CustomEvent('corru_changed'),
    }
}

var swup
var firstLoad = true
var oldPage = {}
var page
var scanner

//initialize the window when dom is ready
ready(()=>{
    change("TEMP!!lastvisit", check("lastload"))
    change("lastload", Date.now())
    if(localStorage['volume']) {
        Howler.volume(localStorage['volume'])
        document.querySelector('#meta-volume-slider').value = localStorage['volume']
    } else Howler.volume(0.5) //we start them at 0.5
    
    scanner = document.querySelector('#mindspike-scanner')
    env.pressedKeys = {}
    body.addEventListener('keyup', function(e) {env.pressedKeys[e.key.toLowerCase()] = false})
    body.addEventListener('keydown', function(e) {env.pressedKeys[e.key.toLowerCase()] = true})

    /////////////////INTERACTIVE STUFF/////////////////////////
    //right clicking is disabled because we have a special context menu! 
    //when out of MUI mode, it will open the MUI (and open a menu when over targets)
    //when IN MUI mode, will just open a menu for the selected targets
    //the array of targets it reads from is set every 100ms a bit further down from here
    document.addEventListener('contextmenu', e=> {
        if(e.target.tagName != "INPUT" && !e.target.classList.contains('allowmenu')) e.preventDefault()
    })

    //MUI examination handler
    //gets the index of the currently selected thingy in the scanner, prints out its examine message
    document.querySelector('#mindspike-examine').addEventListener('click', ()=>{
        readoutAdd({message: env.targetedEntity.text.replace(/\n/g, "<br>"), type: `examine ${env.targetedEntity.type}`, name: env.targetedEntityName, image: env.targetedEntity.image})
        if(env.targetedEntity.exmExec) env.targetedEntity.exmExec()
        play('muiReadout')

        scanner.classList.remove('active')
        env.scannerOpen = false

        //kind of a mouthful atm but marks the entity as having been scanned on the page
        try {
            let currentPageEntities = flags['detectedEntities'][page.title]['entities']
            let trackedEntity = currentPageEntities[env.targetedEntity.name]

            //simply marks as scanned, OR marks the 'alternateOf' as scanned if the entity is an alternate version of some other one
            if(trackedEntity) trackedEntity.scanned = true 
            else if(env.targetedEntity.alternateOf) currentPageEntities[env.targetedEntity.alternateOf].scanned = true
            
            localStorage.setItem('flags', JSON.stringify(flags)) //saves
        } catch(e){ console.log(e) /* no need to do anything, just means it's not a tracked entity */}
    })

    //MUI action handler
    //adds the acting class to the scanner, changing the display to the action one
    //will show options based on the entity object
    //clicking on a button submit will enact that action
    document.querySelector('#mindspike-act').addEventListener('click', ()=>{
        let actOptions = document.querySelector('#act-options')
        actOptions.innerHTML=""
        scanner.classList.add('acting')

        //load entity actions, assign their click handles
        env.targetedEntity.actions.forEach(action => {
            if(shouldItShow(action)){
                //add the option
                actOptions.insertAdjacentHTML('beforeend',`<div class="act-option">${action.name}</div>`)

                //if the action has a response, display it - then exec if it has an exec
                console.log(actOptions.lastChild)
                actOptions.lastChild.addEventListener('click', function(){
                    if(action.message) {
                        var options = {message: action.message.text.replace(/\n/g, "<br>")}
                        if(action.message.actor) options.type = action.message.actor
                        else {
                            options.name = action.name
                            options.image = env.targetedEntity.image
                        }
                        readoutAdd(options)
                    }

                    if(action.exec) {
                        action.exec()
                    }
                    
                    play('muiClick')
                    scanner.classList.remove('active')
                    env.scannerOpen = false
                })
            }
        });
    })

    //closes out of action menu
    document.querySelector('#mindspike-back').addEventListener('click', ()=>{
        scanner.classList.remove('acting')
    })

    //general 'do certain things upon click' handler - all global click stuff (left and right click functions for MUI and hud elements) is in this one p much
    window.addEventListener('mousedown', ev=> {
        if(ev.target.classList.contains('allowmenu') || ev.target.tagName == "INPUT") return

        //determine whether they're clicking an element that ignores scanner mechanics
        let excluded = false
        document.querySelectorAll('#combat .team').forEach(el=>{ if(el.contains(ev.target) && !excluded) excluded = true })

        if(!document.documentElement.classList.contains("cutscene")) { //don't do anything during cutscenes
            if(!scanner.contains(ev.target) || excluded) { //not clicking the mindspike menu or combat menus
                scanner.classList.remove('active')
                env.scannerOpen = false

                //catch elements that are already deleted - can happen with page-specific click events that remove stuff
                //also skips if excluded
                if(ev.target.parentElement == null || excluded) return

                //otherwise, do some target prep
                scannerGetTargets()

                //if clicking the meta icon, toggle MUI
                if(ev.target.id == "meta-icon") {
                    MUI("toggle")

                //if clicking on something under the meta menu, do whatever the link is for
                } else if(ev.target.parentElement.id == "meta-links"){
                    if(!body.classList.contains('in-menu')) {
                        switch(ev.target.id) {
                            case "meta-hub":
                                startDialogue('menu_hub')
                            break

                            case "meta-obs":
                                toggleEntMenu()
                            break

                            case "meta-sys":
                                toggleSysMenu()
                            break
                        }
                    }

                //if left clicking on a target in MUI, show context menu. 
                //if right clicking target, open MUI AND open a target menu. otherwise just open a target menu
                } else if((ev.target.classList.contains('target') || env.targeted.length > 0) && (!body.classList.contains('in-menu'))) {
                    switch(ev.button) {
                        case 0: 
                            if(env.mui) {
                                scannerOpen()
                            }
                        break

                        case 2: 
                            if(!env.mui) MUI("on")
                            scannerOpen()
                        break
                    }

                //if not hovering over a target or MUI element...
                //left click deactivates MUI (like clicking out of an overlay), or closes an active menu if clicked out of a menu box
                //right click toggles mui, or closes an active menu
                } else if(!document.querySelector('#readout').contains(ev.target) && !ev.target.classList.contains('target')) {
                    switch(ev.button) {
                        case 0: 
                            if(env.mui) MUI("off") //simply turn off the MUI if it's open
                            
                            //or if in a non-dialogue menu...
                            else if(body.classList.contains('in-menu') && !body.classList.contains('in-dialogue')) { 
                                //detect if where you're clicking is outside of a menu-box
                                var inMenu = false
                                document.querySelectorAll('.menu-box, .menu').forEach(menu => {if(menu.contains(ev.target)) inMenu = true} )

                                //if you're clicking outside of a menu box, exit the menu!
                                if(!inMenu) {
                                    exitMenu()
                                }
                            }
                        break

                        case 2: 
                            //if right clicking while in a menu (but not dialogue), close the menu
                            if(body.classList.contains('in-menu') && !body.classList.contains('in-dialogue')) {
                                exitMenu()                       
                            } else {
                                MUI("toggle")
                            }
                        break
                    }
                } 

             
            } else if(scanner.contains(ev.target) && ev.target.classList.contains('arrow')) { //clicking a mindspike arrow
                let currentIndex = Number(scanner.style.getPropertyValue('--index'))

                //get the direction
                var change
                switch (ev.target.getAttribute('dir')) {
                    case "left":
                        change = -1
                    break

                    case "right":
                        change = 1
                    break
                }

                if((currentIndex == (env.targeted.length - 1)) && change == 1) { //if they're going over the max
                    env.targetIndex = 0
                } else if((currentIndex == 0) && change == -1) { //if they're going below zero
                    env.targetIndex = env.targeted.length - 1
                } else { //if they're just moving
                    env.targetIndex = currentIndex + change
                }

                scanner.style.setProperty('--index', env.targetIndex)
                env.targetedEntityName = env.targeted[env.targetIndex].getAttribute('entity')
                env.targetedEntity = env.entities[env.targetedEntityName]
                entityShowActions(env.targetedEntity)
            }
        }
    })

    /*a bunch of times a second, check to see if...
    * 1) they're hovering over a target and the MUI is on - stores targets for a variety of fun activities
    * 2) they're hovering over an element with a definition - moves the definition box to the mouse, updates its text, and adds an active class
    */
    setInterval(()=>{
        //definition tracking
        let hovering = document.elementFromPoint(env.cursor.x, env.cursor.y)
        let defbox = document.getElementById('definition-box')

        if(hovering) {
            if(hovering.hasAttribute('definition')) {
                defbox.style.setProperty("--x", env.cursor.x)
                defbox.style.setProperty("--y", env.cursor.y)

                //flip the position of the transform based on which side of the screen it's on
                if(env.cursor.x < (window.innerWidth / 2)) defbox.style.setProperty("--xFlip", 0); else defbox.style.setProperty("--xFlip", -1)
                if(env.cursor.y < (window.innerHeight / 2)) defbox.style.setProperty("--yFlip", 0); else defbox.style.setProperty("--yFlip", -1)

                defbox.classList.add('active')

                defbox.innerText = hovering.getAttribute('definition')
            } else {
                defbox.classList.remove('active')
            }
        }

        //MUI tracking
        if(!env.mui || env.scannerOpen || env.muiProhibited) return
        scannerGetTargets()
    }, 200)

    //activate mousemove event - simply tracks position on both a window and doc level, used for a ton of things
    env.cursor = {x: 0, y: 0}
    env.pageCursor = {x: 0, y: 0}
    window.addEventListener('mousemove', e=> {
        env.cursor.x = e.clientX
        env.cursor.y = e.clientY
        
        env.pageCursor.x = e.pageX
        env.pageCursor.y = e.pageY

        if(typeof env.mouseMove == "function") env.mouseMove() //can be set up per page or per needs as to not need to manage page-internal mousemoves
    })

    //load volume settings and get the spike-button functional first thing
    document.querySelector('#meta-volume-slider').addEventListener('change', e=>{
        localStorage['volume'] = e.target.value
        Howler.volume(e.target.value)
    })

    document.querySelector('#meta-volume-toggle').addEventListener('click', e=>{
        var volume = localStorage['volume']
        if(volume > 0) volume = 0; else volume = 0.5

        document.querySelector('#meta-volume-slider').value = volume
        document.querySelector('#meta-volume-slider').dispatchEvent(new Event('change'))
    })

    /////////////////MENUUUUUUUUUUS////////////
    //sets up permanent system menu fixtures - exporting/importing flags
    //export management
    let saveText = document.querySelector('#savetext')
    document.querySelector('.sysblock #export').addEventListener('click', e=>{
        let fullEncode = LZString.compressToBase64(JSON.stringify(flags))

        let saveEncode = "NEURAL BINARY STRING - DO NOT ALTER::"
        saveEncode += fullEncode
        saveEncode += "::END NEURAL BINARY"
        saveText.value = saveEncode
        
        //select and copy the text
        saveText.select(); saveText.setSelectionRange(0, 999999)
        navigator.clipboard.writeText(saveText.value);

        readoutAdd({message: `NOTE::'data exported';'copied'`, name:"sys"})

        if(LZString.decompressFromBase64(fullEncode) == null) {
            printError('save file is corrupt and unable to export! plz email fiend@corru.works and send the text + what you were doing before', "verbatim")
        }
    })

    //mini inner function for both enter and clicking import
    function importSave(e) {
        e.preventDefault()
        mountSave(saveText.value)
    }

    //hitting enter on the input or clicking import will import from the textarea
    document.querySelector('.sysblock #import').addEventListener('click', importSave)
    saveText.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            importSave(e)
        }
    })

    //save deletion button 
    document.querySelector('.sysblock #delete').addEventListener('click', e=>{
        deleteSave()
    })
    

    ////////////////LOADING STUFF//////////////
    //start swup 
    swup = new Swup({
        containers: ["#content"],
        animationSelector: '#content',
        cache: false,
        animateHistoryBrowsing: false,
        skipPopStateHandling: (e => {return true}), //this outright breaks the back button, because fuck you? LOL
    })

    //set up page actions on swup change
    //moving into page
    swup.on('contentReplaced', function() {
        oldPage = page //saves old page for reference - mainly bgm removal
        setTimeout(()=>{
            eval(document.querySelector('#PageData').innerHTML) //overrides old page obj
            console.log('overrode previous page, calling onload')
            page.onLoaded()

            change("lastload", Date.now())
        }, 100)
    });

    //leaving page
    swup.on('transitionStart', function() {
        page.onLeaving()
        console.log('calling onleave')
    });

    //initialize page if this is the first load
    page.onLoaded()
    console.log('first load, calling onload')

    //////////////////AUDIOOOO/////////////////////////////////
    //audio for permanent fixtures
    document.querySelectorAll(`#mindspike-act, #mindspike-back, #meta-links > *, #meta-icon, .menureturn`).forEach(e=>{
        e.addEventListener('mouseenter', ()=>play('muiHover'))
        e.addEventListener('click', ()=> play('muiClick'))
    })

    // when the page is reloaded, if the user has a log from the same session, restore it
    reloadSessionLog()
    runGPUCheck() //also check their GPU for acceleration cuz it sucks if they don't have it
    
    //chrome detection for fixing flickering
    if(window.chrome) body.classList.add('chromeyum')
})

//chatter
//little tooltip-esque popups over talking entities
//takes an ID of an element with a .chatter div, how long the message ought to show, and the message
//also does a readout if that's specified
function chatter({actor, text, duration = 6000, log = true, readout = false, customEl}) {
    let actorObj = getDialogueActor(actor)
    let parentEl = customEl || document.querySelector(actorObj.element)
    
    //return if you're in dialogue with whoever this is already
    if(env.currentDialogue.active == true && env.currentDialogue.actors[actor] != undefined) return

    //otherwise show the chatter if the element still exists
    if(parentEl) {
        var chatterEl = parentEl.querySelector('.chatter-container')       

        //if the chatter container doesn't exist, add it
        if(!chatterEl) {
            parentEl.insertAdjacentHTML('beforeend','<div class="chatter-container"></div>')
            chatterEl = parentEl.querySelector('.chatter-container')       
        }

        env.totalmessages++

        let chatterID = `chat${env.totalMessages}`
        chatterEl.insertAdjacentHTML('beforeend', `<div class="chatter" id="${chatterID}">${text}</div>`)

        setTimeout(()=>{
            try{
                document.querySelector(`#${chatterID}`).remove()
            } catch(e) { console.log('chatter aborted due to element removal') }
        }, duration)
    }

    if(log) { 
        let logMessage = Object.assign({}, actorObj)
        logMessage.name = actor
        logMessage.message = text
        logMessage.show = readout //stops the minireadout popup from appearing by default
        logMessage.forceMini = readout //but if true, forces the minireadout to show
        logMessage.sfx = actorObj.voice
        readoutAdd(logMessage) 
    }
}

//readout controls
//print a message on the readout
//if an actor name (should be in dialogueActors) is provided, uses info from that instead
function readoutAdd({message, type = "", name, image = false, show = true, forceMini = false, sfx = true, actor = false, noStore = false}) {
    let readout = document.querySelector('#readout')
    let miniReadout = document.querySelector('#minireadout')

    var addition
    if(actor) {
        let actorObj = getDialogueActor(actor)
        addition = getReadoutMsg({message: message, image: actorObj.image, name: actor, type: actorObj.type})
    } else {
        addition = getReadoutMsg({message: message, type: type, name: name, image: image})
    }

    //add the message to the main readout
    readout.insertAdjacentHTML('beforeend', addition)
	readout.scrollTop = readout.scrollHeight //scroll to it on the readout too

    //if the readout isn't open and you aren't in dialogue... (unless forced to show)
    //add the message to the mini readout, with a timer to remove it after a few seconds
    if(show) {
        if((!body.classList.contains('mui-active') && !body.classList.contains('in-dialogue')) || forceMini) {
            miniReadout.insertAdjacentHTML('beforeend', addition)
            let newMessage = document.querySelector(`#minireadout .message-${env.totalMessages}`)
            setTimeout(() => {
                newMessage.classList.remove('active')
                setTimeout(()=>newMessage.remove(), 1000)
            }, 5000);
        }
    }

    //reveal all added stuff after a tiny delay
    let currentMessageNum = env.totalMessages
    setTimeout(()=>document.querySelectorAll(`.message-${currentMessageNum}`).forEach(e=>e.classList.add('active')), 50)
    env.totalMessages++
	
    //play readout add sound if not in dialogue, and also it should be shown
    if(!env.currentDialogue.active) {
        if(sfx == true) play('muiReadout') //no custom sound
        else if(typeof sfx == "function") sfx()
        else if(typeof sfx == "string") play(sfx)
        else if(typeof sfx == "object") {
            play(sfx.sound, sfx.pitch)
        }
    }

    //store message in session log in case of refreshes
    if(!noStore) {
        if(env.logStore.length > 1000) env.logStore.shift();
        env.logStore.push(addition)
        sessionStorage['log'] = JSON.stringify(env.logStore)
    }
}

//gets the HTML for a given readout message
function getReadoutMsg({message, type = "", name, image = false}) {
    var content = "", header = "", eClass = "", effectiveType = type;

    //only set the image if it isn't moth (this will most likely be less specific down the line)
    if(image && name != "moth") {
        header = header + `<img src='${image}'>`
    }

    //actor specific checks
    if(name && name != "sys" && !type.includes("sourceless")) { //actor isn't system or narration, so add their name with the usual prefix/affix
        header = header + `<h2>!!__${name.replace(/ /g, '_')}__!!</h2>`
    } else if (name == "sys") { //actor IS system, so skip for now
        effectiveType = "sys"
    }
    if (name == "moth") effectiveType = "moth" //actor is moth

    if(typeof message == "string") if(message != undefined && !(message.includes("<"))) { //if there's a message and it DOES NOT contain HTML
        message = "<p>" + message + "</p>" //surround it with p tags 
    }

    //effectiveType handles specific actors that may have unique appearances on the readout
    switch(effectiveType) {
        case("moth"):
            header = `<img src="/img/blank.gif" style="background: url(/img/sprites/moth/mothman.gif) white;background-size: 165%;background-position: center top;">` + header
            content = message
            eClass = "moth"
            break

        case("sys"):
            header = `<img src='/img/mui/mindspikelogoactive.gif'>`
            content = message
            eClass = "sys"
            break

        default: 
            content = `${message}`
    }

    //create the final string for the readout message
    var addition = `
        <div class='message ${eClass} ${type} message-${env.totalMessages}'>
            ${header}
            ${content}
        </div>
    `

    return addition
}

//restores the log from the current session - used primarily for refresh points
function reloadSessionLog() {
    if(!sessionStorage['log']) return

    env.logStore = JSON.parse(sessionStorage['log'])
    let readout = document.querySelector('#readout')

    const parser = new DOMParser();
    const fragment = document.createDocumentFragment();
    const messageClassRegex = /message-\d+/;

    env.logStore.forEach(log => {
        const noNumLog = log.replace(messageClassRegex, '');
        const doc = parser.parseFromString(noNumLog, 'text/html');
        const node = doc.body.firstChild;
        
        node.classList.add('active', 'message-restored');
        fragment.appendChild(node);
    });
    
    readout.appendChild(fragment);
    readoutAdd({message: `NOTE::'restored recent log'`, name:"sys", noStore: true, show: false, sfx: false})
}

//entity creation for page use
//takes an entity object with a name - adds it to the environment, then adds to the detectedEntities object for the page it's presently on
function createEntity(entObj) {
    env.entities[entObj.name] = entObj

    //we don't create the entity if it requests to be hidden,
    //OR if it requests to be limited to a certain page 
    //  (useful for entities from one page that need to show up on another, but without adding to the entity list)
    if(
        entObj.hide
        || ((entObj.pathLimit) && (entObj.pathLimit != location.pathname))
    ) return

    //detect if page is in detctedEntities - if not, add it with relevant info
    if(!flags['detectedEntities'][page.title]) {
        flags['detectedEntities'][page.title] = {
            title: page.title,
            path: location.pathname,
            order: page.order,
            image: page.image || '/img/textures/corruripple.gif',
            entities: {}
        }
    }

    var alreadyScanned
    try { alreadyScanned = flags['detectedEntities'][page.title]['entities'][entObj.name].scanned } 
    catch(e) { alreadyScanned = false }

    flags['detectedEntities'][page.title]['entities'][entObj.name] = entObj //this WILL NOT STORE ANY FUNCTIONS - just text/obj info
    if(alreadyScanned) flags['detectedEntities'][page.title]['entities'][entObj.name].scanned = true
}

//MUI action 'has any actions that should show' checker
//if it has valid actions, let the scanner show the ACT button
//otherwise do not
function entityShowActions(){
    var hasActions = false

    if(env.targetedEntity.actions) {
        env.targetedEntity.actions.forEach(action => {
            if(shouldItShow(action)) hasActions = true
        })
    }

    if(hasActions) scanner.classList.add('has-actions')
    else scanner.classList.remove('has-actions')
}

//MUI mouse target detection function
function scannerGetTargets() {
    env.targeted = []

    let targets = document.elementsFromPoint(env.cursor.x, env.cursor.y)
    targets.forEach(el => {
        if(el.classList.contains('target')) {
            el.classList.add('targeted')
            env.targeted.push(el)
        }
    })

    //un-target any previously targeted targets (wow) that aren't under the mouse anymore
    document.querySelectorAll('.targeted').forEach(el=>{
        if(!Array.from(targets).includes(el)) {
            el.classList.remove('targeted')
        }
    })
}

//MUI activation function
function scannerOpen() {
    if(env.mui) {
        //resets the menu
        let scannerEnts = document.querySelector('#mindspike-entities')
        scannerEnts.innerHTML = ``
        env.scannerOpen = true
        env.targetIndex = 0
        scanner.style.left = `${env.cursor.x}px`
        scanner.style.top = `${env.cursor.y}px`
        scanner.style.display = `flex`
        scanner.style.setProperty('--index', 0)
        scanner.classList.remove('multiple', 'active', 'acting', 'has-actions')
        scanner.classList.add('anim-in')

        if(env.targeted.length) {   
            env.targetedEntityName = env.targeted[0].getAttribute('entity')
            env.targetedEntity = env.entities[env.targetedEntityName]
            entityShowActions(env.targetedEntity)
        }

        //reveals after a slight delay so that transitions can happen again
        setTimeout(() => {
            scanner.classList.add('active')
            scanner.classList.remove('anim-in')
        }, 40)
        
        //add HTML for each element
        env.targeted.forEach(entity => {
            scannerEnts.insertAdjacentHTML('beforeend',`<span class="${env.entities[entity.getAttribute('entity')].type}">${entity.getAttribute('entity').replace(/ /g, '_')}</span>`)
        })

        //if there's more than one target, add the selection arrows
        if(env.targeted.length > 1) {
            scannerEnts.insertAdjacentHTML('beforeend', `<div id="mindspike-left" class="arrow" dir="left"><</div><div id="mindspike-right" class="arrow" dir="right">></div>`)
            document.querySelectorAll(`#mindspike-left, #mindspike-right`).forEach(e=>{
                e.addEventListener('mouseenter', ()=>play('muiHover'))
                e.addEventListener('click', ()=> play('muiClick'))
            })
        }

        play('muiScanner')
    } else if(!body.classList.contains('mui-prohibited')) { //if mui is inactive and the body isn't mui-prohibited, activate mui
        MUI("on")
    }
}

//MUI toggles
function MUI(state) {
    switch(state) {
        case "prohibit":
            body.classList.add('mui-prohibited')
            env.muiProhibited = true
        break;
        case "deprohibit":
            body.classList.remove('mui-prohibited')
            env.muiProhibited = false
        break;
    }

    //return if prohibited, or in a transition
    if(body.classList.contains('in-menu') || body.classList.contains('mui-prohibited') || body.getAttribute('state') == "corru-loaded" || body.classList.contains("loading") || body.getAttribute('state') == "corru-leaving") return

    switch(state){
        case "toggle":
            if(env.mui) MUI("off")
            else MUI("on")
        break

        case "on":
            if(!env.mui) play('muiToggle')
            body.classList.add('mui-active')
            env.mui = true
        break

        case "off":
            if(env.mui) play('muiToggle')
            body.classList.remove('mui-active')
            env.mui = false
            
            scanner.classList.remove('active')
            env.scannerOpen = false
        break
    }
}

/* 
    ENTITY MENU
    Toggles the 'viewed pages and their entities' menu.
    if it's not open, add appropriate classes to body and then build + replace contents
    if it is open, close it
*/
function toggleEntMenu() {
    if(body.getAttribute('menu') == "entities")  {
        body.classList.remove('in-menu')
        body.setAttribute('menu', 'none')
    } else {
        MUI('off')
        document.querySelector('#entcontent').innerHTML = ""
        var menuContents = ``

        //for each page, build a div that contains all of the entities in that page, obscuring ones not seen yet
        for (const pageName in flags.detectedEntities) {
            const page = flags.detectedEntities[pageName]
            var entListHTML = ""

            var entCount = 6 //starts at "one row"
            for (const entityName in page.entities) {
                const entity = page.entities[entityName]
                if(entity.scanned) {
                    entListHTML += `<div class="ent scanned ${entity.type}" pagename="${pageName}" entname="${entity.name}" definition="ENTITY::'${entity.name}'" style="transition-delay: ${0.05 * entCount++}s"><img src="${entity.image}"></div>`
                } else {
                    entListHTML += `<div class="ent unscanned ${entity.type}" definition="ENTITY::'unprocessed'::RECOMMEND::'relocation';'[EXM]'" style="transition-delay: ${0.05 * entCount++}s"><img src="/img/textures/static.gif"></div>`
                }                
            }

            menuContents += `<div class="page collapsed" page="${page.title.replace(/[\W_]+/g,"")}" style="--pageImg: url(${page.image}); --entRows: ${Math.floor(entCount/6) || 1}; --pageOrder: ${page.order}">
                <div class="pageheader"><span>${page.title}</span></div>
                <div class="pageents-wrapper">
                    <div class="pageents">${entListHTML}</div>
                </div>
            </div>`
        }

        //add html
        document.querySelector('#entity-menu .pagelist').innerHTML = ""
        document.querySelector('#entity-menu .pagelist').insertAdjacentHTML('beforeend', menuContents)

        //sfx for hover, etc
        document.querySelectorAll(`#entity-menu .pageheader, #entity-menu .ent[entname]`).forEach(e=>{
            e.addEventListener('mouseenter', ()=>play('muiHover'))
            e.addEventListener('click', ()=> play('muiClick'))
        })

        //collapse toggle
        document.querySelectorAll('#entity-menu .pageheader').forEach(e=>{ //pageheaders collapse/uncollapse their parents
            e.addEventListener('click', ()=>e.parentElement.classList.toggle('collapsed'))
        })

        //entity info view event
        document.querySelectorAll('#entity-menu .ent').forEach(e=>{
            if(e.getAttribute('entname')) {
                e.addEventListener('click', ()=>{
                    let entity = flags.detectedEntities[e.getAttribute('pagename')]['entities'][e.getAttribute('entname')]
                    let container = document.querySelector('#entcontent')
                    container.innerHTML = ""

                    let replay = getReadoutMsg({message: entity.text.replace(/\n/g, "<br>"), type: `examine ${entity.type}`, name: entity.name, image: entity.image})
                    container.insertAdjacentHTML('beforeend', replay)
                    setTimeout(()=>container.querySelector('.message').classList.add('active'), 5)
                })
            }
        })

        //show menu
        body.classList.add('in-menu')
        body.setAttribute('menu', 'entities')
        play('muiScanner')
    }
}

/* 
    SYSTEM MENU 
    nothing crazy, just toggling
    more stuff will happen here in the future most likely (i.e. settings)
    we actually turn on the MUI since some things are logged here
*/
function toggleSysMenu() {
    if(body.getAttribute('menu') == "system")  {
        MUI('off')
        body.classList.remove('in-menu')
        body.setAttribute('menu', 'none')
    } else {
        //show menu
        MUI('on')
        body.classList.add('in-menu')
        body.setAttribute('menu', 'system')
        play('muiScanner')
    }
}

function updatePreferenceAttributes() {
    body.setAttribute('quality', check('default_quality') || "high")
    body.setAttribute('low_intensity', check('low_intensity'))
    body.setAttribute('gameplay_off', check('gameplay_off'))
    
    switch(check("size_preference")) {
        case "normal":
            document.documentElement.classList.remove("bigmode")
        break

        case "large":
            document.documentElement.classList.add("bigmode")
        break
    }

    setTimeout(()=>document.querySelector('#readout').scrollTop = document.querySelector('#readout').scrollHeight, 1000)
}

function setQualityPreference(pref) {
    chatter({actor: 'sys', text: `ATTENTION::'default quality';'set to ${pref}'`, readout: true})
    change('default_quality', pref)
    updatePreferenceAttributes()
}

function setIntensityPreference(pref) {
    if(pref) chatter({actor: 'sys', text: `ATTENTION::'reduced intensity alternatives active'`, readout: true})
    else chatter({actor: 'sys', text: `ATTENTION::'reduced intensity alternatives inactive'`, readout: true})

    change('low_intensity', pref)
    updatePreferenceAttributes()
}

function setGameplayPreference(pref) {
    if(pref) chatter({actor: 'sys', text: `ATTENTION::'gameplay enabled'`, readout: true})
    else chatter({actor: 'sys', text: `ATTENTION::'gameplay disabled'`, readout: true})

    change('gameplay_off', !pref)
    updatePreferenceAttributes()
}

function setSizePreference(pref) {
    chatter({actor: 'sys', text: `ATTENTION::'interface size';'set to ${pref}'`, readout: true})
    change('size_preference', pref)
    updatePreferenceAttributes()
}

/* STORY STATE CONTROLS */

//episode progress - will mark or unmark the page with classes based on the 'episode' the player is in
//additionally checks to see if the 'advance log' option should appear
function checkEpisodeProgress(){
    if(check('ep0_epilogue') && check('ep1_showmaterials')) { body.classList.add('ep1'); env.ep1 = true } else { body.classList.remove('ep1'); env.ep1 = false }
    
    if(check('fbx__ep2intro-end')) { 
        body.classList.add('ep2')
        env.ep2 = true 
    } else { 
        body.classList.remove('ep2')
        env.ep2 = false 
    }

    if(check('fbx__ep3intro')) { 
        body.classList.add('ep3')
        env.ep3 = true 
    } else { 
        body.classList.remove('ep3')
        env.ep3 = false 
    }

    if(
        (check('ep0_epilogue') && !check('ep1_showmaterials')) ||
        (check('ep1_end') && !check('fbx__ep2intro-end')) ||
        (check('embassy__d3_movefriend_finish') && !check('fbx__ep3intro'))
        ) {
        document.querySelector('#advance-notice').classList.add('active')
    } else {
        document.querySelector('#advance-notice').classList.remove('active')
    }
}

///////////////////////////////////////////helpers
//simple error reporter
function printError (e, showErrorWarning = true) { 
    if(showErrorWarning == "verbatim") chatter({actor: 'actual_site_error', text: e, readout: true})
	else if(showErrorWarning) chatter({actor: 'actual_site_error', text: "something actually fucked up (not a part of the story) details are in the log and console", readout: true})
	chatter({actor: 'actual_site_error', text: e})
    console.log(e)
}

//easy menu exit
function exitMenu(closeMUIToo = true) {
    delete env.draggable
    switch(body.getAttribute('menu')) {
        case "augment":
            play('obeskToggle')
        break

        default:
            play('muiToggle')
    }

    body.classList.remove('in-menu')
    body.setAttribute('menu', 'none')
    if(window.vn) {
        vn.hideStage(false, false)
        vn.fadeChars(false)
    }

    if(closeMUIToo) MUI('off')
}

//jquery document.ready equivalent
function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

//cutscene toggles
function cutscene(state) {
    if(state) {
        document.documentElement.classList.add('cutscene')
        env.cutscene = true
    } else {
        document.documentElement.classList.remove('cutscene')
        env.cutscene = false
    }
}

//current save deleter
function deleteSave() {
    MUI('off'); flash(true); cutscene(true); exitMenu();
    if(env.bgm) env.bgm.fade(env.bgm.volume(), 0, 10000)
    corruStatic.play()
    corruStatic.fade(0, 1, 5000)
    MUI('prohibit');

    readoutAdd({message: `ATTENTION::'clearing mindspike cache';'15 seconds';'refresh to cancel'`, name:"sys"})
    setInterval(()=>play('muiHover', 2), 1000);
    setTimeout(()=>readoutAdd({message: `ATTENTION::'clearing mindspike cache';'in 10 seconds';'refresh to cancel'`, name:"sys"}), 5000)
    setTimeout(()=>readoutAdd({message: `ATTENTION::'clearing mindspike cache';'in 5 seconds';'refresh to cancel'`, name:"sys"}), 10000)
    setTimeout(()=>{ readoutAdd({message: `ATTENTION::'clearing mindspike cache';'now'`, name:"sys"}); play('muiToggle', 0.5)}, 14000)
    setTimeout(()=>{
        flags = undefined
        localStorage.removeItem('flags')
        location.replace('/')
    }, 16000)
}

//save mounter
function mountSave(savestring) {
    if(!savestring) {
        readoutAdd({message: `ERROR::'data unspecified'`, name:"sys"});
        return
    }

    try {
        let saveVersion = savestring.split("::")[0]
        let saveData = savestring.split("::")[1]
        var decodedSave

        switch(saveVersion) {
            case "NEURAL BINARY STRING - DO NOT ALTER":
                decodedSave = LZString.decompressFromBase64(saveData)
            break

            case "v1":
                decodedSave = decodeURIComponent(atob(saveData))
            break

            default:
                decodedSave = atob(saveData)
        }

        if(decodedSave == null) {
            printError('this save file is corrupt! plz email fiend@corru.works about it and send the save too just in case', "verbatim")
            throw 'save load error'
        }

        flags = JSON.parse(decodedSave)
        localStorage.setItem('flags', JSON.stringify(flags))
        sessionStorage.clear()

        exitMenu()
        
        readoutAdd({message: `NOTE::'data imported';'${saveVersion == "NEURAL BINARY STRING - DO NOT ALTER" ? "updated data format" : "legacy data format"}'`, name:"sys"})
        
        //transition out
        flash(true);cutscene(true);MUI('off');
        if(env.bgm) env.bgm.fade(env.bgm.volume(), 0, 1000)
        corruStatic.play()
        corruStatic.fade(0, 0.5, 1000)

        setTimeout(()=>{
            readoutAdd({message: `ALERT::RELOADING::...'`, name:"sys"})
        }, 1500)
        
        setTimeout(()=>{
            location.replace('/')
        }, 3000)

    } catch(e) {
        readoutAdd({message: `ERROR::'data format invalid';'unable to process'`, name:"sys"})
        console.log(e)
    }
}

//loading mechanism to be used in onLoaded - adds scripts and styles IN ORDER of the array given
function addResources(resList, i = 0) {
    env.loading = true; body.classList.add('loading')
    if(i == resList.length) {
        body.classList.remove('loading')
        return env.loading = false 
    }

    let res = resList[i]
    let resEl
    console.log(res)

    if(res.includes(".js")) { //script
        resEl = document.createElement('script')
        resEl.src = `${res}?v=${page.cacheval}`

    } else if(res.includes(".css")) { //style
        resEl = document.createElement('link')
        resEl.href = `${res}?v=${page.cacheval}`
        resEl.rel = "stylesheet"
        resEl.type = "text/css"
    } else { throw 'unsupported resource type for this function sry bro' }
    
    content.appendChild(resEl)
    resEl.onload = ()=>addResources(resList, i+1)
}

//progress & event tracking shortcuts
function change(key, value) {
    var flagpool = flags
    if(key.includes("TEMP!!")) flagpool = sessionStorage
    if(key.includes("PAGE!!")) flagpool = page.flags

    switch(value) {
        case "++":
            if(!flagpool[key]) flagpool[key] = 1
            else flagpool[key] = Number(flagpool[key]) + 1
        break

        case "--":
            if(!flagpool[key]) flagpool[key] = -1
            else flagpool[key] = Number(flagpool[key]) - 1
        break

        default:
            flagpool[key] = value
    }

    localStorage.setItem('flags', JSON.stringify(flags))
    checkEpisodeProgress()

    // Dispatch the change event
    document.dispatchEvent(new CustomEvent('corru_changed', { detail: { key, value } }));
}

//basic flag lookup - this just checks against the flags object, or something within it
// [keyname]                - regular key, top level
// [dialogue]__[keyname]    - dialogue key - having __ swaps flagpool to look in seen dialogues instead
// exm|[pathname]|[entname] - checks to see if you've scanned the given ent in the specified location - pathname can be part of a URL rather than the whole one, (i.e. "local" to check in all /local/ areas). ALSO, slashes are ignored from target (i.e. localdullvessel, no /)
function check(inputKey, inputValue = null) {
    let key = inputKey	
    let value = inputValue

    if(key.includes('exm|')) {  //checking to see if an ent is scanned
        let query = key.split('|')
        let targetLocation = query[1]
        let targetEntity = query[2]
        var foundEntity = false

        //runs through pages until it finds at least one page with the specified entity, then breaks
        for (const pageName in flags.detectedEntities) {
            const page = flags.detectedEntities[pageName];
            let strippedPath = page.path.replace(/[/]/g, '');

            if(strippedPath.includes(targetLocation)) {
                let entity = page.entities[targetEntity]
                if(entity) if(entity.scanned) foundEntity = true
            }
        }

        if(value === true)          return foundEntity == true
        else if(value === false)    return foundEntity == false
        else                        return foundEntity

    } else if(key.includes('pa|')) { //checking to see if someone is timestopper'd in the page.party object
        if(!page.party) return 'no party'
        let query = key.split('|')
        let partyLimit = page.party.partyLimit || 3
        let present = page.party.slice(0, partyLimit).some(mem => mem.slug === query[1])

        if(value === true)          return present == true
        else if(value === false)    return present == false
        else                        return present

    } else if(key.includes('aug|')) { //checks to see if augment is in use by anyone in party
        let query = key.split('|')
        if(!page.party) return 'no party'
        let usingAugment = page.party.some(member=>{
            if(member.augments) return member.augments.includes(query[1])
        })

        if(value === true)          return usingAugment == true
        else if(value === false)    return usingAugment == false
        else                        return usingAugment

    } else if(key.includes('item|')) { //checking to see if an item is in the party inventory
        //item|name|gt, #   greater than
        //item|name|lt, #   less than
        //item|name|gte, #   greater than/equal
        //item|name|lte, #   less than/equal
        //item|name, #      equals
        //item|name, false  has none    
        //item|name, true   has any     
        //item|name, (none) has any     

        let query = key.split('|')
        let itemCheck = checkItem(env.ITEM_LIST[query[1]])
        let comparison = query.length > 2 ? query[2] : false

        if(typeof value == "number") {
            switch(comparison) {
                case "gt":  return itemCheck > value
                case "lt":  return itemCheck < value
                case "gte": return itemCheck >= value
                case "lte": return itemCheck <= value
                default:    return itemCheck == value
            } 
        }

        else if(value === false)    return itemCheck == 0
        else                        return itemCheck > 0

    } else { //checking for regular flag
        let flagPool = flags
        if(key.includes("ENV!!")) {flagPool = env; key = key.replace("ENV!!", '')} //ENV!! is the session/page environment, it gathers content as you go through different areas and contains almost everything
        if(key.includes("TEMP!!")) flagPool = sessionStorage //TEMP!! is per session
        if(key.includes("PAGE!!")) flagPool = page.flags //PAGE!! is per page
        if(key.includes('__') || key.includes('++')) { //__/++ indicates dialogue related, ++ is global
            flagPool = flags.dialogues
            if(!key.includes('-')) key = key + "-start" //if you're checking the general name of the dialogue, check the start visibility instead
        } 

        if(typeof flagPool[key] == "undefined") { //it's undefined
            if(value === null || value === true) return false
            else if(value == false) return true
        } else { //it's defined
            if(flagPool[key] === value) { // basic comparison
                return true
            } else if(flagPool[key] && value === null) { //checking for truthiness
                return flagPool[key]
            } else if(value === false && (flagPool[key] == false || flagPool[key] == "false")) { //checking for falsiness
                return true
            } else {
                return false
            }
        }  
    }
}

//sort of like check, but takes either a string, array, or 2d array of CHECK conditions (or EXECs)
//this is used to check if all of the "showIf" conditions are true - primarily in dialogue, but also in stage locks
function getShowValidity(showIf, execArg) {
    console.log(showIf)
    if(typeof showIf == "undefined") return true

    var conditions = []

    if(typeof showIf == 'function') {
        console.log('func, attempting with:', execArg)
        conditions.push(showIf(execArg))

    } else {
        //evaluates 2d array, [[key, val], [key, val]]
        //we do some standardizing since showIfs can come in a few forms
        showIf = upgradeShowIf(showIf)

        showIf.forEach(flag => {
            if(flag[0].startsWith('EXEC::')) { //this means that the flag in question is an exec string, so execute it and put the return in conditions
                conditions.push(Function(`return ${flag[0].replace('EXEC::', '')}`)())
            } else {
                if(flag.length == 1) conditions.push(check(flag[0]))
                else conditions.push(check(flag[0], flag[1]))
            }
        })
    }

    //returns a check of if all conditions are true - .every(boolean) returns true if everything is truthy
    console.log(conditions)
    return conditions.every(Boolean)
}

//'upgrades' a 'showIf' object to be its most verbose form ([[thing], [thing, true]])
//this undoes shorthands used across showIf and lets us expect a standard 'shape' when using getShowValidity
function upgradeShowIf(showIf) {
    let newShowIf = showIf

    if(Array.isArray(showIf)) {
        if(Array.isArray(showIf[0])) return showIf //no changes needed
        else newShowIf = [showIf] //simple upgrade to 2D needed
    } else if(typeof showIf == "string") {
        newShowIf = [[showIf]] //ditto
        //if it's a string, it's either an EXEC:: string or a regular string
        //so this can just be wrapped in two arrays
    }

    return newShowIf
}

//changes env.bgm to the specified new bgm, storing the old as env.oldBgm
function changeBgm(newBgm, {length = 1000, preserve = true, rate = false, seek = false} = {}) {
    if(env.bgm == newBgm) return

    let oldBgm = env.bgm
    oldBgm.fade(env.bgm.volume(), 0, length);
    setTimeout(()=>oldBgm.stop(), length)
    if(preserve) { 
        env.oldBgm = oldBgm
        env.oldBgm.saveRate = oldBgm.rate()
    }

    env.bgm = newBgm
    if(rate) env.bgm.rate(rate)
    if(seek) env.bgm.seek(seek)
    env.bgm.volume(0)
    env.bgm.play()
    env.bgm.isFading = true
    env.bgm.on('fade', ()=> {if(env.bgm) env.bgm.isFading = false}) //on fade completion
    env.bgm.fade(0, 1, length);
}

//reverts env.bgm to the last saved env.oldBgm, then clears oldBgm
function revertBgm(length = 1000) {
    if(!env.oldBgm) return
    changeBgm(env.oldBgm, {length: length, preserve: false, rate: env.oldBgm.saveRate})
    env.oldBgm = false
}

//distinct from changing music, since this pauses the old one instead
//despite the name it won't actually turn off the music at this time
//i mostly use this for handling what song an area should have
function toggleBgm(song) {
    if(!song) return
    if(!song.playing()) {
        oldbgm = env.bgm
        env.bgm = song

        env.bgm.volume(0)
        env.bgm.play()
        env.bgm.fade(0, env.bgm.intendedVol || 1, 400)
        oldbgm.fade(oldbgm.intendedVol || 1, 0, 400)
        setTimeout(()=>oldbgm.pause(), 400)
    }
}

//basic slugify function to make json-friendly names, this is from some stack overflow somewhere
function slugify(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '_') // collapse whitespace and replace by -
        .replace(/-+/g, '_'); // collapse dashes

    return str;
}    

function round(x, to) {
    return Math.round(x / to) * to
}

//page change shortcut
function moveTo(destUrl, closeMui = true){
    if(closeMui) {
        MUI("off")
        MUI("deprohibit")
    }
    swup.loadPage({url: destUrl})
    if(body.classList.contains('in-dialogue')) endDialogue()
}

//commit page die to help performance during long sessions
function corruRefresh() {
    body.classList.add('corru-refreshing')
    if(env.bgm) {
        env.bgm.isFading = true
        env.bgm.fade(env.bgm.volume(), 0, 4000)
    }

    MUI('off'); MUI('prohibit');flash(true); cutscene(true); exitMenu();
    
    readoutAdd({message: `ATTENTION::'data processing complete';'refreshing local memory'`, name:"sys"})
    setTimeout(()=>{play("status", 0.3)}, 1000)
    setTimeout(()=>{window.top.location=window.top.location}, 5000)
}

//quick transition toggle
function flash(state, velzie = false) {
    switch(state) {
        case true:
            if(velzie) body.classList.add('flash', 'velzie')
            else { body.classList.add('flash'); body.classList.remove('velzie') }
        break
        case false:
            body.classList.remove('flash', 'velzie')
        break
    }
}

//basic rand
function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

//easy async wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* AUDIO */
//static cuz we always use it
var corruStatic = new Howl({
	src: ['/audio/static.ogg'],
	preload: true,
	loop: true,
    volume: 0.4,
	sprite: {
		__default: [1000, 13000, true]
	}
});

//global SFX map
var sfxmap = new Howl({
    src: ['/audio/csfxmap.ogg'],
    preload: true,
    html5: false,
    volume: 0.75,
    sprite: {
        talk1: [0, 1000],
        talk2: [1000, 1000],
        talk3: [2000, 1000],
        talk4: [3000, 1000],
        talk5: [4000, 1000],
        talk6: [5000, 1000],
        talk7: [6000, 1000],
        talk8: [7000, 1000],
        muiToggle: [8000, 1000],
        muiScanner: [9000, 1000],
        muiReadout: [10000, 1000],
        muiHover: [11000, 1000],
        muiClick: [12000, 1000],
        criticalError: [13000, 11000],
        talkhigh1: [24000, 1000],
        talkhigh2: [25000, 1000],
        talkhigh3: [26000, 1000],
        talkhigh4: [27000, 1000],
        talkhigh5: [28000, 1000],
        talkhigh6: [29000, 1000],
        talkhigh7: [30000, 1000],
        talkhigh8: [31000, 1000],
        talklaugh1: [32000, 1000],
        talklaugh2: [33000, 1000],
        talklaugh3: [34000, 1000],
        talklaugh4: [35000, 1000],
        talklaugh5: [36000, 1000],
        talklaugh6: [37000, 1000],
        talklaugh7: [38000, 1000],
        talklaugh8: [39000, 1000],
        talksignal1: [40000, 1000],
        talksignal2: [41000, 1000],
        talksignal3: [42000, 1000],
        talksignal4: [43000, 1000],
        talksignal5: [44000, 1000],
        talksignal6: [45000, 1000],
        talksignal7: [46000, 1000],
        talksignal8: [47000, 1000],
        hit: [48000, 1000],
        miss: [49000, 1000],
        crit: [50000, 1000],
        chomp: [51000, 1000],
        stab: [52000, 1000],
        status: [54000, 2000],
        shot1: [56000, 1000],
        shot2: [58000, 1500],
        shot3: [60000, 1000],
        shot4: [62000, 1500],
        shot5: [66000, 1500],
        shot6: [68000, 2000],
        click1: [70000, 250],
        click2: [70250, 500],
        destabilize: [72000, 2000],
        mend: [74000, 2000],
        talkcore1: [76000, 1000],
        talkcore2: [77000, 1000],
        talkcore3: [78000, 1000],
        talkcore4: [79000, 1000],
        talkcore5: [80000, 1000],
        talkcore6: [81000, 1000],
        talkcore7: [82000, 1000],
        talkcore8: [83000, 1000],
        talkgal1: [84000, 1000],
        talkgal2: [85000, 1000],
        talkgal3: [86000, 1000],
        talkgal4: [87000, 1000],
        talkgal5: [88000, 1000],
        talkgal6: [89000, 1000],
        talkgal7: [90000, 1000],
        talkgal8: [91000, 1000],
        fear: [92000, 2000],
        guard: [94000, 2000],
        dull: [96000, 3000],
        obeskClick: [100000, 1000],
        obeskHover: [101000, 1000],
        obeskToggle: [102000, 2000],
        talkgel1: [104000, 1000],
        talkgel2: [105000, 1000],
        talkgel3: [106000, 1000],
        talkgel4: [107000, 1000],
        talkgel5: [108000, 1000],
        talkgel6: [109000, 1000],
        talkgel7: [110000, 1000],
        talkgel8: [111000, 1000],
        __default: [0, 1]
    }
});

//general function for playing from the SFXmap
//we drop the volume of the bgm slightly when playing something
env.recentSfx = false
function play(sfxName, pitch = true, volume = 0.75) {
    if(env.recentSfx) return
    env.recentSfx = true
    
    //we may change this depending on the SFX played
    var sfx = sfxName
    
    //randomize the pitch slightly by default
    if(pitch === true) {
        sfxmap.rate((Math.random() * 0.2) + 0.9) 
    } else if(typeof pitch == "number") { //set the pitch if specified
        sfxmap.rate(pitch)
    } else { //otherwise false
        sfxmap.rate(1)
    }

    //if this uses a talk sound, we randomly select one of eight
    switch(sfxName) {
        case "talk": sfx = `talk${rand(1, 8)}`; break
        case "talkhigh": sfx = `talkhigh${rand(1, 8)}`; break
        case "talklaugh": sfx = `talklaugh${rand(1, 8)}`; break
        case "talksignal": sfx = `talksignal${rand(1, 8)}`; break
        case "talkcore": sfx = `talkcore${rand(1, 8)}`; break
        case "talkgal": sfx = `talkgal${rand(1, 8)}`; break
        case "talkgel": sfx = `talkgel${rand(1, 8)}`; break
        //shot also has a variety
        case "shot": sfx = `shot${rand(1, 6)}`; break
    }

    //duck the BGM briefly so the SFX doesn't layer with it too hard
    if(env.bgm && !env.bgm.isFading && !env.noBgmDuck) {
        env.bgm.volume(0.5)
        setTimeout(()=>{ try{env.bgm.fade(0.5, env.bgm.intendedVol ? env.bgm.intendedVol : 1, 500)} catch(e) {} }, 500)
    }
    
    //play!
    setTimeout(()=>env.recentSfx = false, 50)
    sfxmap.volume(volume)
    sfxmap.play(sfx)    
}

/* ratween - rough rate tweening using howler and some timeouts */
function ratween(howl, desiredRate, duration = 1000) {
    let startingRate = howl.rate()
    if(startingRate == desiredRate) return

    //split the duration into 50ms chunks and execute them
    let stepLength = 50
    let steps = duration / stepLength
    for (let i = 1; i < (steps + 1); i++) {
        setTimeout(()=>{
            howl.rate(startingRate + ((i/steps) * (desiredRate - startingRate)))
            console.log(startingRate + ((i/steps) * (desiredRate - startingRate)))
        }, stepLength * i)
    }
}

/** terrible practice area **/
//add random extension to Array
Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

//get angle between two points
function calculateAngle(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.atan2(dy, dx) * (180 / Math.PI);
}

/* polyfills */
/**
 * String.prototype.replaceAll() polyfill
 * https://gomakethings.com/how-to-replace-a-section-of-a-string-with-another-one-with-vanilla-js/
 * @author Chris Ferdinandi
 * @license MIT
 */
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(str, newStr){

        // If a regex pattern
        if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
            return this.replace(str, newStr);
        }

        // If a string
        return this.replace(new RegExp(str, 'g'), newStr);

    };
}

//simple 'keep number in range' solution
if(!Math.clamp) {
    Math.clamp = (number, min, max) => {
        return Math.max(min, Math.min(number, max));
    }
}

/* SPECIAL NETWORK CALLS OR CHECKS DONE AFTER LOADING */
//GPU detection - this is done to show an alert to turn on acceleration
function runGPUCheck(){
    DetectGPU.getGPUTier().then(res => {
        if(res.type == "FALLBACK") { //if this result happens, it means hardware acceleration is off (or they don't have a GPU... frightening thought)
            if(!check('ignoregpu')) {
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="gpu-warning">
                        <div class="sysblock">
                            <div class="sysbox">
                                <h3>!!__WARNING__!!</h3>
                                <span class="syscription">Realtime log and memory rendering requires GPU hardware acceleration. Your mindspike either lacks a GPU, or hardware acceleration is inactive. Proceeding without resolving this issue will most likely result in pain.</span>
                                <span class="syscription">To enable hardware acceleration, enter your viewer settings, search for "hardware" or find it in the performance/system section, and toggle it on. A restart of the viewer may be necessary.</span>
                                <div class="buttons">
                                    <span id="gpu-done" class="button" onclick="document.querySelector('#gpu-warning').remove()">i fixed it</span>
                                    <span id="gpu-hide" class="button" onclick="javascript:change('ignoregpu',true);document.querySelector('#gpu-warning').remove()">i don't care</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `)
            }
        }
    })
}

//??? wa da he
async function gmss() {
    let mss = {
        state: -1,
        status: "no connection",
        code: "error"
    }

    await fetch("https://state.corru.network/").then(response => response.json()).then(json=> mss = json)

    document.querySelectorAll('.mindsci-status').forEach(el=>{
        el.setAttribute('state', mss.state)
        el.setAttribute('status', mss.status)
        el.setAttribute('code', mss.code)
        el.setAttribute('definition', `NETWORK::'${mss.status}'`)
    })
    env.mss = mss
}

gmss()
setInterval(gmss, 300000)