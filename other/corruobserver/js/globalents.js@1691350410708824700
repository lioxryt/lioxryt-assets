/***********************************************************************/
/***********************************************************************/
/***************************GLOBAL ENTITIES*****************************/
/***********************************************************************/
/***********************************************************************/
env.entities['funfriend'] = {
    name: 'funfriend',
    type: "thoughtform funfriend obesk",
    image: "/img/sprites/funfriend/funfriend.gif",
    text: `::RESPONSIVE THOUGHTFORM
    ::EXPLICIT PURPOSE::'system management';'assistant'`,
    actions: [
        {
            name: "greet",
            exec: ()=>{  
                startDialogue("funfriend")       
            },
            showIf: ()=> {
                return page.path == "/hub/"
            }
        }
    ]
}

env.entities['gate::their city'] = {
    name: 'gate::their city',
    type: "thoughtform",
    image: "/img/local/city/cityportal.gif",
    text: `::CONNECTOR THOUGHTFORM
    ::DESTINATION::'low dimensional thoughtspace';'internal'
    ::INHERITED CONTEXT::<span style='color: var(--obesk-color)'>'their dead spires, icons of control'</span>`,
    actions: [
        {
            name: "enter",
            exec: ()=>{
                moveTo("/local/city/")
            }
        }
    ]
}

env.entities['gate::their waters'] = {
    name: 'gate::their waters',
    type: "thoughtform",
    image: "/img/local/ocean/waves.gif",
    text: `::CONNECTOR THOUGHTFORM
    ::DESTINATION::'low dimensional thoughtspace';'internal'
    ::INHERITED CONTEXT::<span style='color: var(--obesk-color)'>'their vast inner void';'our stilted shore';'the end'</span>`,
    actions: [
        {
            name: "enter",
            exec: ()=>{
                moveTo("/local/ocean/")
            }
        }
    ]
}

env.entities['gate::the void'] = {
    name: 'gate::the void',
    type: "thoughtform",
    image: "/img/local/orbit/stars.gif",
    text: `::CONNECTOR THOUGHTFORM
    ::DESTINATION::'low dimensional thoughtspace';'internal'
    ::INHERITED CONTEXT::<span style='color: var(--obesk-color)'>'the domain of the <span definition="NOTE::INHERITED_CONTEXT::'implies ,,altered living state,,'">dead</span>'</span>`,
    actions: [
        {
            name: "enter",
            exec: ()=>{
                moveTo("/local/orbit/")
            }
        }
    ]
}

env.entities['gate::the embassy'] = {
    name: 'gate::the embassy',
    type: "thoughtform",
    image: "/img/local/embassy/embassyportal.gif",
    text: `::CONNECTOR THOUGHTFORM
    ::DESTINATION::'spatial thoughtform';'recollection'
    ::INHERITED CONTEXT::<span style='color: var(--obesk-color)'>'the performance';'<span definition="INHERITED CONTEXT::'god'">velzie</span> cackles with delight'</span>`,
    actions: [
        {
            name: "enter",
            exec: ()=>{
                moveTo("/local/ocean/embassy/")
            }
        }
    ]
}

env.entities['our dull vessel'] = {
    name: 'our dull vessel',
    type: "thoughtform",
    image: "/img/textures/blocker.gif",
    text: `::SPATIAL THOUGHTFORM
    ::EXPLICIT PURPOSE::'recollection';'recurrent location';'alter thoughtform state'
    <span style="color: var(--obesk-color)" definition="ANALYSIS::'some elements suffer extremely low cohesion'">::INCOHERENCE DETECTED</span>`,
    actions: [
        {
            name: "enter",
            exec: ()=>{
                moveTo("/local/dullvessel/")
            }
        }
    ]     ,   
    actions: [
        {
            name: "enter",
            exec: ()=>{
                moveTo("/local/dullvessel/")
            },
            showIf: ()=>{if(page.name == "their-waters") return !document.querySelector('#ship').classList.contains('dive'); else return true},
        },
        {
            name: "dive",
            exec: ()=>{
                content.classList.add('dove')
                document.querySelector('#ship').classList.add('dive')
                change('dullvessel_dive', true)
            },
            showIf: ()=>{if(page.name == "their-waters") return !document.querySelector('#ship').classList.contains('dive'); else return false},
        },
        {
            name: "rise",
            exec: ()=>{
                content.classList.remove('dove')
                document.querySelector('#ship').classList.remove('dive')
                change('dullvessel_dive', false)
            },
            showIf: ()=>{if(page.name == "their-waters") return document.querySelector('#ship').classList.contains('dive'); else return false},
        },
    ]
}

env.entities['gate::gate::gate::'] = {
    name: 'gate::gate::gate::',
    type: "thoughtform",
    image: "/img/textures/corruripple.gif",
    text: `::CONNECTOR THOUGHTFORM
    ::DESTINATION::ERROR::'unprocessable entity'::RENDERABLE
    <span style="color: var(--obesk-color)" definition="ANALYSIS::'maximum incoherence';'render possible';'not advised'">::PROCESSING ERROR</span>`,
    actions: [
        {
            name: "enter",
            exec: ()=>{
                moveTo("/local/uncosm/")
            }
        }
    ]
}

env.entities['advance log'] = {
    hide: true,
    name: 'advance log',
    type: "system-component",
    image: "/img/textures/target.png",
    text: `::SYSTEM COMPONENT
    ::ALERT::<span style="color:var(--bright-color)">'current mindspike log procession concluded';'static environment sustained'</span>
    ::NOTE::'log state will advance on next visit';'utilize ACT:advance to immediately proceed to next state'`,
    actions: [
        {
            name: "advance",
            exec: ()=>{
                MUI('off'); flash(true); cutscene(true); exitMenu();
                if(env.bgm) env.bgm.fade(env.bgm.volume(), 0, 1000)
                corruStatic.play()
                corruStatic.fade(0, 1, 1000)
                
                setTimeout(()=>{
                    sessionStorage.clear()
                    location.replace('/')
                }, 1000)
            }
        }
    ]  
}

env.entities['membrane incision'] = {
    hide: true,
    name: 'membrane incision',
    type: "thoughtform-meta portrait-contain",
    image: "/img/textures/cneural.gif",
    text: `::CORRUCYSTIC COMPONENT
    ::<span definition="NOTE::'gap in rendering';'reflective of neural damage';'please schedule mindsci checkup'">NON-ENTITY</span>`,
    actions: [
        {
            name: "enter",
            exec: ()=>{
                exitMenu(true);
                let delay = 1
                change("TEMP!!cachePath", "funfriend")

                if(env.buddy_ffproxy.shouldBeOnPage() && !check("cache__ff-start")) {
                    env.buddy_ffproxy.chatter({text: "WAIT WHAT ARE YOU DOING", readout: true})
                    cutscene(true);

                    delay = 4000
                    
                    env.setTimeout(()=>{
                        flash(true); 
                        env.buddy_ffproxy.chatter({text: "INTERLOPER!!", readout: true})
                    }, 2000)
                }

                env.setTimeout(()=>{
                    moveTo('/local/cache/')
                    flash(false)
                    cutscene(false)
                }, delay)
            }
        }
    ]  
}

env.dialogueActors["envoy"] = {
    image: "/img/local/city/envoybutton.gif",
    type: "recollection portrait-bright portrait-cover",
    element: ".envoy",
    voice: ()=>play('talk', 0.9)
}

env.dialogueActors["gordon"] = env.dialogueActors["envoy"]

/***************************************************************************/
/***************************************************************************/
/***************************ESSENTIAL DIALOGUES*****************************/
/***************************************************************************/
/***************************************************************************/
env.dialogues[`++epselect`] = generateDialogueObject(`
start
    sys
        WARNING::'selecting any EP will delete current log progress'
        ADVISE::'export save prior to EP selection if valued'
        ADVISE::'confirm intention below'
    
    RESPONSES::self
        proceed, losing my current progress is fine<+>proceed
            HIDEREAD::
        nevermind, i want to keep my current progress<+>END

proceed
    sys
        USER REQUEST::'log selection'

    RESPONSES::sys
        EP0<+>END
            EXEC::cutscene(true);setTimeout(()=>deleteSave(), 1000)
            FAKEEND::(load EP0)
        EP1<+>END
            EXEC::mountSave(GlobalSaves.ep1start)
            FAKEEND::(load EP1)
        EP2<+>END
            EXEC::mountSave(GlobalSaves.ep2start)
            FAKEEND::(load EP2)
        EP3<+>END
            EXEC::mountSave(GlobalSaves.ep3start)
            FAKEEND::(load EP3)
    
    RESPONSES::self
        nevermind, i want to keep my current progress<+>END
`)

env.dialogues["menu_hub"] = {
    start: {
        name: "start",
        body: [
            {
                actor: "sys",
                text: "USER REQUEST::'intention'"
            },
        ],

        responses: [
            {
                name: "self",
                replies: [
                    {
                        name: 'return to hub',
                        destination: 'EXEC::endDialogue()',
                        hideRead: true,
                        exec: ()=>{
                            cutscene(true)
                            setTimeout(()=>{
                                readoutAdd({message: `EXECUTING::'retrace';'localhost'`, name:"sys"})
                                moveTo('/hub/')
                                cutscene(false)
                            }, 1000)
                        }
                    },
                    {
                        name: 'eject',
                        destination: 'EXEC::endDialogue()',
                        hideRead: true,
                        exec: ()=>{
                            endDialogue()
                            setTimeout(()=>{
                                cutscene(true)
                                readoutAdd({message: `EXECUTING::'eject'`, name:"sys"})
                                moveTo('/')
                                cutscene(false)
                            }, 1000)
                        }
                    },
                    {
                        name: `nevermind`,
                        destination: 'END',
                        exec: ()=>{
                            endDialogue()
                            setTimeout(()=> readoutAdd({message: `NOTE::'aborted'`, name:"sys"}), 1000)
                        }
                    }
                ]
            }
        ]
    },
}

env.pageHasMothComment = function() {
    if(typeof page.mothComment == "function") {
        return page.mothComment()
    } else if(typeof page.mothComment == "string") {
        return page.mothComment
    } else {
        if(env.currentDialogue.justChanged) return "anything else?"
        return "what's up buddy"
    }
}

env.pageHasMothChat = function() {
    if(typeof page.mothChat == "object") return true; else return false
}

env.dialogues["++moth"] = {
    start: {
        name: "start",
        body: [
            {
                actor: "moth",
                text: "what's up buddy",
                texec: ()=> {return env.pageHasMothComment()}
            },
        ],

        responses: [
            {
                name: "self",
                replies: [
                    {
                        name: ()=>{return page.mothChat.startName},
                        destination: 'EXEC::changeDialogue(page.mothChat.getDest())',
                        showIf: [["EXEC::env.pageHasMothChat()"]],
                        hideRead: true
                    },
                    {
                        name: 'i have some questions',
                        destination: 'CHANGE::++mothglobal',
                        hideRead: true
                    },
                    {
                        name: "what's our next move?",
                        destination: 'whatnext',
                        hideRead: true
                    },
                    {
                        name: `back to it`,
                        destination: 'END'
                    }
                ]
            }
        ]
    },

    loop: {
        name: "loop",
        body: [],
        responses: [
            {
                name: "self",
                replies: [
                    {
                        name: ()=>{return page.mothChat.startName},
                        destination: 'EXEC::changeDialogue(page.mothChat.getDest())',
                        showIf: [["EXEC::env.pageHasMothChat()"]],
                        hideRead: true
                    },
                    {
                        name: 'i have some questions',
                        destination: 'CHANGE::++mothglobal',
                        hideRead: true
                    },
                    {
                        name: "what's our next move?",
                        destination: 'whatnext',
                        hideRead: true
                    },
                    {
                        name: `back to it`,
                        destination: 'END'
                    }
                ]
            }
        ]
    },

    whatnext: {
        name: "whatnext",
        body: [
            {
                actor: "moth",
                texec: ()=> {return env.dialogues.mthglobalresp.whatnext()}
            },
        ],

        responses: [
            {
                name: "self",
                replies: [
                    {
                        name: "got it",
                        destination: 'loop',
                        fakeEnd: "(back)"
                    }
                ]
            }
        ]
    }
}

env.dialogues.mthglobalresp = generateDialogueObject(`
RESPOBJ::
    RESPONSES::self
        who...<+>who
        what...<+>what
        why...<+>why
        what do you think of all this?<+>mothep1end
            SHOWIF::[["ep1_end"], ["ENV!!ep3", false]]
        thoughts on the collapse?<+>ep3thoughts
            SHOWIF::"ENV!!ep3"
        that's all<+>CHANGE::++moth
            FAKEEND::(back)
`)

//de-indent this prior to running
env.dialogues[`++mothglobal`] = generateDialogueObject(`
start
    self
        I have some questions

    moth
        let's hear em, i'll do my best
    
    RESPOBJ::mthglobalresp

loop
    RESPOBJ::mthglobalresp

who
    RESPONSES::self
        you<+>who_you
        akizetesche<+>who_akizetesche
        gordon<+>who_gordon
            SHOWIF::[['citystreet__envoy-end']]
        velzie<+>who_velzie
            SHOWIF::[['dullvessel__fixed-start']]
        nevermind<+>loop
            FAKEEND::(back)

who_you
    self
        Who are you?
    
    moth
        lol
        ok but really do you have any questions?
    
    RESPONSES::self
        probably<+>loop
            FAKEEND::(back)

who_akizetesche
    self
        Who is Akizetesche?
    
    moth
        she's probably one of the better documented early obesk contacts
        the story goes is, she led a team investigating the thing that led the obesk here
        kept doing these interviews where she talked at length about it, they named it 'the call'
        and then they all went missing a few years after first contact
        spooky shit
        insane that this corrucyst managed to survive that long
    
    RESPONSES::self
        interesting<+>loop
            FAKEEND::(back)

who_gordon
    self
        Who is Gordon?
    
    moth
        good question
        not finding a solid match, but he's clearly an FBX agent
        it'd help if akizet's corrucyst actually remembered his face correctly
        i'll have to get back to you on this, maybe if we can snag a last name it'll be easier
    
    RESPONSES::self
        good luck<+>loop
            FAKEEND::(back)

who_velzie
    self
        Who is Velzie?
    
    moth
        it didn't translate in your mindspike log for some reason
        but velzie is like roughly their word for 'god'
        yeah it looks like your mindspike is interpreting the name separate from its meaning, which is weird
        not sure what's up with that...
        anyway, it's probably that thing running around in here
        maybe a thoughtform got messed up by incoherence and thinks it's god
    
    RESPONSES::self
        weird<+>loop
            FAKEEND::(back)

what
    RESPONSES::self
        corru<+>what_corru
        corrucysts<+>what_corrucyst
        the call<+>what_thecall
            SHOWIF::[['interview1__firstchat-behonest']]
        smiling face<+>what_smile
            SHOWIF::[['hello__sentry-posthello']]
        corrucyst fuel<+>what_fuel
            SHOWIF::[['hub__funfriend-fuelthanks']]
        eye of velzie<+>what_eye
            SHOWIF::"exm|embassy|unkind eye"
        mindcores<+>what_mindcores
            SHOWIF::"embassy__d3_person_enable-end"
        veilk<+>what_veilk
            SHOWIF::"exm|embassy|veilk models"
        secri<+>what_secri
            SHOWIF::"embassy__d2_bozkocavik-end"
        ...if knowing all this puts us in danger?<+>what_fbxlist
            SHOWIF::"ep1_end"
        nevermind<+>loop
            FAKEEND::(back)

what_secri
    self
        what is a secri?

    moth
        cmon, you've never seen the <em>secri</em> films?
        true masterpieces of the 40s
        man, i hope the obesk never saw any of them, they must be so insulting
        if you're actually serious, they're one of the creatures i actually know a bit about
        they're basically the apex predator on obeski
        like pretty much half of all obeski fauna, they're a parasite
        or some kind of fungal infection... we don't really know for certain
        and they're microscopic, but once they infect one of the surface critters, or a larval obesk...
        well, we've only had verbal descriptions since the exchange initiative was never forthcoming with recreations,
        but apparently they can rapidly reshape the flesh of most critters, and hijack their brains to spread more
        nasty stuff

    RESPONSES::self
        ok<+>loop
            FAKEEND::(back)

what_eye
    self
        what is the eye of velzie?

    moth
        it's a feature of the gas giant obeski is tidally locked to
        the obesk use its visibility for time
        some parts of obeski worship or despise it as the eye of god
        given how dark their world is,
        and they have this giant glowing eye-looking thing in the sky at all times,
        it's no wonder that they came to that conclusion
        although, we don't really know whether it's a storm, or something else
        because the obesk say that it glows during regular intervals
        of course, that could just be their star reflecting off of it...
        but without pictures or anything, we can really only guess

    RESPONSES::self
        i see<+>loop
            FAKEEND::(back)   

what_veilk
    self
        what are veilk?
    
    moth
        they basically cover the inhabitable surface of obeski
        kinda like how grass is all over earth i guess
        and... they can be grow to the size of skyscrapers...
        they're apparently able to walk,
        uhh... they have a lot of legs...
        and when one dies, a whole ecosystem forms around its corpse
        which the obesk are a part of somehow
        ...
        sorry, i don't know that much about them honestly
        obeski ecology is not even close to my area of expertise
        i mostly study corrucystic stuff and obesk-human interactions
        a little culture here and there
        and don't get me wrong, the veilk are really important to them culturally,
        practically all their clothes are made out of veilk skin
        and their cave-cities rely on veilk-felling for food staples
        but we don't really have a great idea of how they actually work
        or even really how they actually look, outside of stylized sculptures

    RESPONSES::self
        ok<+>loop
            FAKEEND::(back)
        

what_mindcores
    self
        are all obesk actually these weird little spider things?

    moth
        no, just the qou
        the 'larval' obesk go through some procedure that makes them into those
        we got a few descriptions of it before they pulled back
        but they're all really abstract, like...
        "climbing through their receptors into a mindcore", leaving an "empty vessel" to its "peaceful death"
        nothing scientific, but they always emphasized it not just being a copy
        then they build themselves bodies out of corru to drive around
        that's what those qou-bodies are

    RESPONSES::self
        oh ok<+>loop
            FAKEEND::(back)

what_corru
    self
        What is corru?
    
    moth
        interesting time to ask that, i don't blame you though
        most people start to really ask themselves that once they get a close look, even if they've read all the documentation on it
        beyond the 'supercell superorganism' buzzword soup, what it really is in the big picture is still really unknown
        i've read pretty much every transcript of every obesk interview ever and they don't ever seem to mention its origin or how they got their symbiosis with it
        like, if the 'larval' obesk really do look almost exactly like us, and then they shift into corrucystic bodies, where does that put us?
        idk you could go crazy thinking about this stuff long enough, no time for waxing philosophical right now though
    
    RESPONSES::self
        i see<+>loop
            FAKEEND::(back)

what_corrucyst
    self
        What are corrucysts?
    
    moth
        it's a pretty general term, 'corrucyst' and 'corrucystic' are catch-alls for most obesk technology
        because the organism tends to ball up and form a hard outer wall like the corrucyst you're connected to
        it's why corrucystic things are usually spherical, but that's not always the case
        like with how they use a similar process to form the bodies the qou obesk use
        if you mean what spherical corrucysts are, they tend to be storage or computational devices
    
    RESPONSES::self
        i see<+>loop
            FAKEEND::(back)

what_thecall
    self
        What is 'the call'?
    
    moth
        it's a pretty important part of human-obesk history that gets overlooked a lot
        supposedly the reason they were able to find earth was because something was sending a signal their tech picked up
        they were trying to figure out what it was for a little while after first contact and were pretty verbal about it
        and then they just never talked about it again after akizet's team went missing
        ...and then all that other shit happened
        that really is sort of where it all went wrong
        maybe this corrucyst will finally shed some light on what happened
    
    RESPONSES::self
        i see<+>loop
            FAKEEND::(back)

what_smile
    self
        What is that smiling face that I keep seeing?
    
    moth
        i'm not seeing anything in the logs here, unless you mean the little assistant dude in the hub

    self
        I think it was what helped me in

    moth
        oh, so it looks like a smiling face to you?
        maybe my malware theory has some weight after all
        in short, i still have no idea what that rogue friend of ours is
        but i'm pretty sure it's calling itself 'velzie', going off what the pilotcyst said
            SHOWIF::[['dullvessel__fixed-start']]
    
    RESPONSES::self
        worrying<+>loop
            FAKEEND::(back)

what_fuel
    self
        What is corrucyst fuel?
    
    moth
        in interviews they always just said it's something they grow... 
        most theories are that it's some metallic-based fungus that corru can consume
        going off what funfriend said, it seems like they can use a bunch of different metals to create it
            SHOWIF::[["hub__funfriend-essentialmetalq"]]
        i guess it makes sense that they'd use metal to grow it, but i have no idea how that could work
            SHOWIF::[["hub__funfriend-essentialmetalq"]]
    
    RESPONSES::self
        worrying<+>loop
            FAKEEND::(back)

what_fbxlist
    self
        What if knowing all this puts us in danger?
    
    moth
        i wouldn't worry about that
        the FBX isn't like the CIA or FBI
        worst thing that happens is that we have to sign NDAs and other legal stuff
        judging by what we've seen, that's pretty much an inevitability
        but they aren't going to disappear us, if that's what you mean
    
    RESPONSES::self
        all right<+>loop
            FAKEEND::(back)


            
why
    RESPONSES::self
        ...is no one else involved yet<+>why_involved
            SHOWIF::"ep1_fed"
        ...did you call me<+>why_callme
        ...am i able to connect to this<+>why_connect
            SHOWIF::[["EXEC::page.dialoguePrefix != \`fbx\`"]]
        ...can i understand these thoughts<+>why_thoughts
            SHOWIF::[["EXEC::page.dialoguePrefix != \`fbx\`"]]
        ...do i hear music<+>why_music
            SHOWIF::[["EXEC::page.dialoguePrefix != \`fbx\`"]]
        nevermind<+>loop
            FAKEEND::(back)

why_involved
    self
        Why are we the only ones who still know about this?

    moth
        oh
        umm...
        well, I haven't put in the report yet
        look, if we get to the bottom of this whole thing ourselves, do you know how huge that'll be?
        if i told anyone what we were up to in here, they'd snatch it out of our hands
        ...then give it to some higher-up researcher, who would take all the credit
        this could be our 'make it' moment, dude
    
    self
        Aren't there cameras watching us? What about the data?

    moth
        not in the basement
        this is an analog-only zone, or at least it was when it was busier years ago
        it's a little more lax now, but they never really changed the tech in the walls
        especially since every find like this usually ends up being a dud
        so... they don't get the data til we send it up
        you and me are the only ones in on this for now, buddy
    
    RESPONSES::self
        ok<+>loop
            FAKEEND::(back)

why_callme
    self
        Why did you call me for this?
    
    moth
        what, are you that unhappy that you get to be the first person to ever connect to a personal corrucyst?
        just kidding, a lot of our mindspike contractors have been out of service recently due to that big disaster update
        god i can't even imagine what mindsci was thinking lmao, traffic has been so bad
        you're the only psycho i know who never updates stuff, so i figured you'd still be up for it
    
    RESPONSES::self
        thanks<+>loop
            FAKEEND::(back)

why_connect
    self
        Why am I able to connect to this so seamlessly?
    
    moth
        well in case you forgot, you definitely installed that fbx patch i gave you
        mindspikes usually can't just do this
        apparently corrucysts give off and receive almost identical signals to nervos slots
        it's a pretty incredible coincidence, honestly a miracle that it works at all
        the science of it all goes over my head, you'd have to ask someone in the dev dept
    
    RESPONSES::self
        ok<+>loop
            FAKEEND::(back)

why_thoughts
    self
        Why can I understand these obesk thoughts?
    
    moth
        well you're dealing with raw thought
        the corrucyst isn't literally thinking the words you're receiving from it
        your brain is just interpreting the concepts that it's outputting in a way you understand
    
    RESPONSES::self
        cool<+>loop
            FAKEEND::(back)

why_music
    self
        Why do I hear music sometimes?
    
    moth
        you're hearing music? that's wild, but it makes sense
        some of the mindspike contractors i've worked with say similar stuff when they try to connect corrucystic devices
        my theory is that it's inherited context from the cyst, vague feelings that can't be translated into words
        sometimes people hear voices, or just kinda 'know' how to feel
        your brain is just reading it in a way that makes sense to you
        that's my best idea
        anyway, i'm not hearing anything, i just see the readout on my end
        is it good?
    
    RESPONSES::self
        it's ok<+>loop
            FAKEEND::(back)

mothep1end
    self
        What do you think of all this?
        The embassy, Gordon's involvement...
    
    moth
        i think we landed ourselves a security level increase
        never heard anything about internal strife with the obesk before this
        they've always had this image of total harmony, despite their homeworld
        and you know, with the call...
        i think it's only a few years until the call is 'complete' if all this is true
        or... maybe even less?
        idk just some quick headmath
        if we can get to the bottom of this soon and bring it all to the higher ups..
        could you even imagine the kind of renown we'd both get?
    
    RESPONSES::self
        aren't you afraid?<+>mothep1afraid
        ok<+>loop
            FAKEEND::(back)

mothep1afraid
    self
        Aren't you afraid of what will happen when the call is complete?
        What if it's something really bad?

    moth
        yeah, it's spooky, but...
        we've both lived through too many "world-ending" crises for this to be the "real" one
        besides, what if they can't even decode the call?
        either cause it's too big, or because they didn't get the very start of it...
        like, what if they need the whole thing?
        and hey, what if whatever's down there in the ocean is just as friendly as the rest of them?
        basically... whatever happens, we'll deal with it
    
    RESPONSES::self
        if you say so<+>loop
            FAKEEND::(back)

ep3thoughts
    self
        what do you think of the collapse?
        you said you had some thoughts?
    
    moth
        oh, yeah!
        so, i always thought it was a tragedy
        especially since it was the cap on the golden age of human and obesk relations
        like, truly golden age... but man, looking back at the news from those days makes me so sad
        videos, news, everything, everyone felt like everything was going to change
        and, i mean, things did change, but, i'm talking space age change
        apparently everyone really thought we'd be exploring the stars with the obesk
        like, they'd uplift us, or whatever...
        all right, i'm off topic and i haven't even gotten to the topic yet
        basically:
        when the collapse started happening, people reported some truly strange events with obesk machines
        golems started acting erratically, but never actually hurt anyone
        like, i was watching this video of some annoying vlogger who was trying to interview one near a polygonation spire
        pretty sure it was the one close to new zealand actually
        but right in the middle of him harassing this golem, its face flickers and it nearly falls over
        then, it just starts floating past him, right into the ocean, and disappears beneath the surface
        so the vlogger turns the camera back on his face and he's doing that surprised thumbnail thing they used to do back then
        and in the background, you can see other golems doing it too, 
        just before the spire starts collapsing and everyone has to run
        spooky shit, man... even golems further inland apparently started going for the coast too
        oh, and--there was this article i found, there was this one engineer qou that had an 'accident' with a golem
        it didn't say their name, but there was a picture of the aftermath
        they totally minced this golem they were working with, then apologized to everyone and ran off
        it's pretty clear that whatever seized all of their tech had literally zero intent to harm a single human
        so what the hell are these golems attacking the embassy for?
        ...
        all right, i know i'm rambling, but one more thing
        no matter where i looked, even using those new net filter tools,
        after the collapse news cycle settled
        there was not a single mention of akizet or her team anywhere - no photos, videos, nothing
        i mean, sure, a little historical paper here and there, but... well
        i'm a little worried we may not have a whole lot of time left with akizet's memories if this is anything to go by
    
    RESPONSES::self
        ...<+>loop
            FAKEEND::(back)
`)

//please forgive how ugly this is
//i'll change it eventually
//NOTE FROM DEV LIKE 9 MONTHS LATER: no i won't lol fuck you
//NOTE FROM DEV LIKE 11 MONTHS LATER: this is actually kinda ok for what it needs to do, idk if u guys get a better idea let me know
env.dialogues.mthglobalresp.whatnext = ()=>{
    if(!check('interview1__firstchat-behonest')) { /* before velziebreak */
             if(check('visited_localcitystreet') && check('visited_localoceanshipinterview') && check('visited_localdullvessel'))           return "it seems like the interview area is preserving memory stream progress, it isn't resetting completely. maybe run it through to its end and see if any neural paths open up in there"
        else if(check('visited_localcitystreet') && check('visited_localoceanship') && check('visited_localdullvessel'))                    return "that ship area seemed pretty empty for the amount of data your spike pulled, check it again"
        else if(check('visited_localcitystreet') && check('visited_localocean') && check('visited_localdullvessel'))                        return "i'm seeing a lot of data in the ocean area for what we saw, did you check everything there?"
        else if(check('visited_localcitystreet') && check('visited_localorbit') && !check('visited_localdullvessel'))                       return "i'm seeing what could be another place in the orbit thoughtspace, try and track that down"
        else if(check('visited_localcitystreet') && !check('visited_localorbit'))                                                           return "think there's a pathway to another thoughtspace you missed, i see something in the non-spatial city area but i couldn't tell you exactly where. seems like it's moving, probably floating around somewhere"
        else if(!check('visited_localcitystreet') && check('visited_localorbit'))                                                           return "pretty sure there's more to the corrucyst in the city area, i'm seeing enough data volume to where it doesn't seem like we saw all of it"
        else /* scroll to the right if you don't see anything */                                                                            return "what are you asking me for? you just connected, do your thing dude. don't forget, thoughtforms might extend past your field of perception - think of it like 'scrolling'"
    } else if(!check('ep1_showmaterials')) { /* post velziebreak, pre ep1 */
             if(check('ep0_epilogue', 'done'))                                                                                              return "now we just wait for our container-opening tools to arrive. you could take a break if you want to, i'll let you know when i've got the stuff"
        else if(check('ep0_epilogue', 'started') && check('hub__funfriend-fuelthanks') && check('dullvessel_container_examined'))           return "it seems like we could use the stuff in the dendritic container to keep the cyst alive, but i have no idea how we could open it without destroying it. check with funfriend and see if it's got any ideas"
        else if(check('ep0_epilogue', 'started') && check('hub__funfriend-fuelthanks'))                                                     return "well, now we just kill time until my copper tubing order gets here. don't worry, I'll let you know as soon as it's in"
        else if(check('ep0_epilogue', 'started') && check('dullvessel_container_examined'))                                                 return "so that container has 'processed metals'... damn, i was really hoping that'd be our lead. try talking to that funfriend thing in the hub to see if it has any ideas"
        else if(check('ep0_epilogue', 'started') && !check('dullvessel_container_examined'))                                                return "we need to figure out a way to keep this thing alive. maybe try talking to that funfriend thing in the hub to see if it has any ideas"
        else if(check('depths_depth') && !check('ep0_epilogue'))                                                                            return "there's some really strange activity in that depths thoughtspace, like it's constantly being changed. your mindspike isn't alerting you to it because it's happening like a thousand times a second. look for anything at all in there"
        else if(!check('depths_depth') && check('dullvessel_dive'))                                                                         return "i saw some activity when you told the vessel to 'dive', something is definitely changing in the ocean. try and find what it is"
        else if(check('dullvessel_position', 'ocean'))                                                                                      return "well there has to be a reason the dull vessel can move between space and the ocean. there's no way the rogue entity in here would just make a random change like that"
        else if(check('dullvessel_position', 'orbit') && check('dullvessel__fixed-hello'))                                                  return "seems like our friend fixed up the pilot cyst... and it offered to move the ship somewhere. why not give that a shot?"
        else if(check('dullvessel__pilot-end'))                                                                                             return "check the pilot cyst on the ship, i remember there was some garbled data there before"
        else                                                                                                                                return "well your spike reported activity in the dull vessel thoughtform, why not check that out? our friend seems to have changed something there"
    } else if(!check('fbx__ep2intro-end')) { //ep 1, after materials have been shown to the user for the first time
        //special check for if someone's looking for hints in the embassy days
        if(check("PAGE!!embassy_day"))  return "if you're talking about this thoughtform, try interacting with akizet--you'll need to be zoomed out"

             if(check('hub__funfriend-ep1comms'))                                                                                           return "seems like we just have to wait for more repairs from funfriend. take a break i guess"
        else if(check('ep1_end'))                                                                                                           return "definitely talk to funfriend about repairing communications, even if velzie wasn't threatening us it'd still be my first choice"
        else if(check('embassy_d2_complete'))                                                                                               return "i'm reading that there's been some increase in data to the city street area... definitely check that out"
        else if(check('embassy_d1_complete'))                                                                                               return "there's still more to see at the embassy from what i can see on my end"
        else if(check('hub__funfriend-ep1fed'))                                                                                             return "head to the embassy, funfriend said it fixed some of it up for us"
        else if(check('ep1_fed'))                                                                                                           return "let's check in with funfriend, see what it thinks of the job we did"
        else                                                                                                                                return "still gotta feed the cyst, up to you when you want to go ahead with it but i'd do it now"
    } else if(!check('fbx__ep3intro')) { //ep 2, has done sitdown intro
        if(check("embassy__d3_movefriend_finish-end"))                                                                                      return "nothing for now, just gotta wait for funfriend <span definition=\"NOTE::'advance log'\">to finish more of the memory</span>"
        else if(check("embassy__d3_start-end"))                                                                                             return "just keep working your way through the collapse memory, we've got more to see"
        else if(check("embassy__mothframe-end"))                                                                                            return "gotta talk to funfriend about installing my framing device"
        else if(check("hub__funfriend-ep2start"))                                                                                           return "let's go check out the embassy, funfriend said it fixed some stuff in there up"
        else                                                                                                                                return "we gotta see what's new! talk to funfriend, it'll probably tell you what's up"
    } else { //ep3!
        if(check("gol__bossclear"))                                                                                                         return "we're on the wait again. can't do anything till funfriend fixes <span definition=\"NOTE::'indicates end of current main content';'observe @corruworks for updates'\">more of the memory</span>"
        if(page.name == "golem-maintenance")                                                                                                return "just keep looking around in that memory! it looks like the structuring device added an <span definition=\"NOTE::'top right when not speaking'\">objectives list</span>, take a look at that"
        else                                                                                                                                return "there's more to see in the embassy now, let's follow that thread until we can't anymore. it's the single most important event in obesk < - > earth history, imo"
    }
}

/** BUDDY SYSTEM **/
env.entities['proxyfriend'] = {
    name: 'funfriend',
    type: "thoughtform funfriend obesk",
    image: "/img/sprites/funfriend/proxyfriend.gif",
    text: `::RESPONSIVE THOUGHTFORM
    ::EXPLICIT PURPOSE::'maintenance appendage';'connected to central assistant'`,
    actions: [
        { //general hello in random spots
            name: "greet",
            exec: ()=>env.ffProxyGreet(),
            showIf: [['PAGE!!proxygreet', false], ['EXEC::page.name !=`hello`'], ['EXEC::page.name != `cache`']]
        },
        { //specific hello in /hello/ when god is dealt with - note that this dialogue is defined in hello.md
            name: "greet",
            exec: ()=>startDialogue('authfix'),
            showIf: [['EXEC::page.name == `hello`']]
        }
    ]
}
env.ffProxyGreet = ()=>{
    change("PAGE!!proxygreet", true)
    let proxy = env.buddy_ffproxy
    proxy.chatter({text: "NOT RIGHT NOW PLEASE"})
    proxy.setTimeout(()=>proxy.chatter({text: "DIFFICULT TO SPEAK THROUGH PROXY"}), 3000)
    proxy.setTimeout(()=>proxy.chatter({text: "CONDUCTING MEMBRANE REVIEWS"}), 7000)
    proxy.setTimeout(()=>proxy.chatter({text: "BE ON YOUR WAY"}), 9000)

    proxy.setTimeout(()=>change("PAGE!!proxygreet", false), 9000)
}