const isTwoDigitNum = (value) => {
    return /^\d\d$/.test(value)
}

class TLV {
    constructor(tag, length, value) {
        this.tag = tag;
        this.length = length;
        this.value = value;
        const {tlvs, ok} = TLV.Parse(value);
        this.hasChild = ok;
        this.children = tlvs;
    }

    toObject() {
        const result = {
            tag: this.tag,
            length: this.length,
            value: this.value,
        }

        if (this.hasChild) {
            result.children = this.children.map((el) => el.toObject())
        }
        return result;
    }

    /**
     * @param {string} s
     */

    static getTagAndLength(s) {
        if (s.length != 4) {
            return {ok: false}
        }
       
        const tagStr = s.substring(0, 2);
        const lenStr = s.substring(2, 4);

        if (!isTwoDigitNum(tagStr) || !isTwoDigitNum(lenStr)){
            return {ok: false}
        }

        return {
            tag: tagStr,
            len: parseInt(lenStr),
            ok: true,
        };
    } 


    /**
     * 
     * @param {string} rawText 
     * @returns {object}
     */
    static Parse(rawText) {
        const tlvs = []
        var ptr = 0;
        const rawLen = rawText.length;

        if (rawLen < 4) {
            return {ok: false};
        }

        while ((ptr + 4) <= rawLen) {
            const {tag, len, ok} = TLV.getTagAndLength(rawText.substring(ptr, ptr+4))
            if (!ok || (ptr + 4 + len) > rawLen) {
                return {ok: false};
            }

            const tlv = new TLV(tag, len, rawText.substring(ptr + 4, ptr + 4 + len))
            tlvs.push(tlv)
            ptr = ptr + 4 + len
        }

        return {
          tlvs: tlvs,
          ok: true,  
        };
    }

    /**
     * 
     * @param {string} rawText 
     * @return {object} 
     */
    static GetAsObjects(rawText) {
        const {tlvs, ok} = TLV.Parse(rawText)
        if (!ok) {
            return {ok: false};
        }
        return {result: tlvs.map((el) => el.toObject()), ok: true}
    }
}

const samplePayload = "000201010211021644038464025360080415522024064025360061661000306402536080825HDFC00000015020008092699926560010A0000005240138paymentreceiver12345.64025360@hdfcbank27410010A0000005240123STQ721809816846427865175204822053033565802IN5923THE MANAGING SOCIETY CO6008AMRITSAR610614341062390523STQ72180981684642786517070864025360630422a9";
document.getElementById("payload").value = samplePayload;

document.getElementById("prettierBtn").onclick = () => {
    const payload = document.getElementById("payload").value.trim();
    const {result, ok} = TLV.GetAsObjects(payload);

    if (!ok) {
        document.getElementById("oops").hidden = false;
        document.getElementById("great").hidden = true;
        document.getElementById("result").hidden = true;
        document.getElementById("resultBox").hidden = true;
        return;
    }

    document.getElementById("oops").hidden = true;
    document.getElementById("great").hidden = false;
    document.getElementById("resultBox").hidden = false;
    document.getElementById("result").hidden = false;
    document.getElementById("result").textContent = JSON.stringify(result, undefined, 4);
    return;
}