import { useState, useEffect } from 'react'

interface Reaction {
    name: string;
    emoji_1: number;
    emoji_2: number;
    emoji_3: number;
    emoji_4: number;
    emoji_5: number;
    emoji_6: number;
    emoji_7: number;
    emoji_8: number;
}

function OneReaction({ slug, eid, emoji, count }: { slug: string, eid: string, emoji: string; count: number }) {
    const [clicked, setClicked] = useState<number>(0)
    const updateReaction = () => {
        setClicked(clicked + 1)
        let req: any = { name: slug }
        req[eid] = 1
        fetch(`/api/reactions/add/`, {
            method: "POST",
            body: JSON.stringify(req)
        }).then()
    }
    return <button style={{ "marginRight": "1em" }} onClick={updateReaction}>{emoji} {(count || 0) + clicked}</button>
}

function Reactions({ slug, reaction }: { slug: string, reaction: Reaction }) {
    return <div>
        <OneReaction slug={slug} eid="emoji_1" emoji="❤️" count={reaction.emoji_1} />
        <OneReaction slug={slug} eid="emoji_2" emoji="👍" count={reaction.emoji_2} />
        <OneReaction slug={slug} eid="emoji_3" emoji="😅" count={reaction.emoji_3} />
        <OneReaction slug={slug} eid="emoji_4" emoji="💩" count={reaction.emoji_4} />
        <small>Reactions powered by <a href="https://neon.tech/" target="_blank">Neon</a></small>
    </div>
}

export default function ({ slug }: { slug: string }) {
    const [reaction, setReaction] = useState<Reaction | null>(null)
    useEffect(() => {
        async function tryFetch() {
            for (let i = 0; i < 3; i += 1) {
                try {
                    let json = await (await fetch(`/api/reactions/get/?slug=${slug}`)).json()
                    setReaction(json.reactions)
                    break
                } catch (e) {
                    console.error(e)
                    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
                    await sleep(2000)
                    continue
                }
            }
        }
        tryFetch().then(() => { })
    }, [])
    // const reaction = { "name": "test", "emoji_1": 1, "emoji_2": 2, "emoji_3": 3, "emoji_4": 4, "emoji_5": 5, "emoji_6": 6, "emoji_7": 7, "emoji_8": 8 }
    return reaction ? <Reactions slug={slug} reaction={reaction} /> : <div></div>
}
