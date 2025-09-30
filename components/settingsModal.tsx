import React,{useState,useEffect} from "react";
import {Modal} from "flowbite-react"
import { HiOutlineTrash } from "react-icons/hi";
import { reCalculateAll,parseGrades,letterGradeColor} from "../utils/grades";
import {colorShit} from "./colors"
import {gradingScale} from "../utils/grades"
import { count } from "console";

/*

I'm thinkin:

Letter grade bounds / grades   (mayyybe colors, but I'd rather infer)

Category names and weights (sawwy can't auto detect this...)

Rounding rules (checkbox system)

gpa and final exam stuff can happen laterrrrrrrr
*/
 


//TODO: finish modal, determine means of retroactive application, determine if it's necessarry to await the settings fetch at the very beginning, decide a format for storage of 
//this shi


/*
Okay, at this point, what's up is thus:
need to add rounding part of modal,
need to add the checks and shit for the save function

need to unify the format and pick a primary one for the gradingScale object

unify accross: on courses attribute, in grades.ts, and on backend,

need to implement settings fetch in initial gradebook fetch via extraData

need to implement fallback if gradebook settings fetch fails

need to implement save-settings fetch


*/

export default function SettingsModal({client,index,showModal,setShowModal,grades,setGrades,createError}){
    	  const course = index==-1 ? {name:"default",teacher:{name:""},period:""} : grades?.courses[parseInt(index)];
        const [letterScale,setLetterScale]=useState<gradingScale["letterScale"] | undefined>(index!=-1 ? (grades?.courses[parseInt(index)].gradingScale?.letterScale || undefined) : grades?.gradingScales.default.letterScale)
        const [active,setActive]=useState<[string,string]>(['',''])
     //   const [rounding,setRounding]=useState(false)
   //     const [decimalPlaces,setDecimalPlaces]=useState<number>(0)






function mutate(e,letter,bound){
    setLetterScale((prev)=>{
        let temp=structuredClone(prev)
        temp[letter][bound]=(e.target.value)
        return temp
    })
}

//lazy
function mutate2(e,letter,bound){
    console.log(e,letter,bound,letterScale)
    setLetterScale((prev)=>{
        let temp=structuredClone(prev)
        temp[letter][1][bound]=parseFloat(e.target.value)
        console.log("i hate u",temp)
        return temp
    })
}

function deleteLetter(letter){
    let temp=structuredClone(letterScale)
    temp=temp.slice(0,letter).concat(temp.slice(letter+1))
    setLetterScale(temp)

}

function addLetter(){
    let temp=structuredClone(letterScale)
    temp=temp.concat([["X",[0,0]]])
    setLetterScale(temp)

}



//endpoints
const endpointUrl="https://studentvuelib-clean.up.railway.app"

async function getSettings(url,userHash){
   const result= await (await fetch(endpointUrl+"/getSettings",
    {'method':'POST',
      'headers':{'Content-Type':'application/json'},
      'body':JSON.stringify({url:url,userHash:userHash})}
  )).json()

  return result
}


async function setSettings(url, userHash,encrypted,passHash,settings){
      const result = await (await fetch(endpointUrl+"/setSettings",{
            'method':'POST',
            'headers':{'Content-Type':'application/json'},
            'body':JSON.stringify({url:url,userHash:userHash,encrypted:encrypted,passHash:passHash,settings:settings})
        })).json()
    return result
}


async function saveNew(){
  
    if(validate()){
        
        const newScale = {
...grades.gradingScales[course.name+course.period+course.teacher.name],  letterScale: [...letterScale].sort((a, b) => a[1][1] - b[1][1]).reverse()
};
        if(!newScale.rounding){newScale.rounding==undefined}
        const augmentedGrades=structuredClone(grades)
        augmentedGrades.gradingScales[course.name+course.period+course.teacher.name]=newScale

    const result=await setSettings(client.district,client.username,client.encrypted,client.password,augmentedGrades.gradingScales)
    if(result.status){
        console.log("success")
        
    

    
        setGrades(reCalculateAll(augmentedGrades))
        setShowModal(false)


    }
    else{
        console.log(result)
        createError("Failed to sync settings with server, try again?")
    }


    }
    else{
       
        createError("Malformed Scale")
    }


}



async function reset(allClasses=false){
  if(index==-1&&!allClasses){
  const result=await getSettings(client.district,"pleaseGodLetNobodySomehowMagicallyHashToThisHashOrItBreaks")
  if(result.status){
    const countyDefault=result.settings.default;
    console.log("success")
    let temp=structuredClone(grades)
    temp.gradingScales.default=countyDefault
    setLetterScale(countyDefault.letterScale)

  }
  else{
    createError("Failed to retrieve default settings")
  }





  }
  else{
    let temp=structuredClone(grades)
    if(allClasses){
      temp.gradingScales={default:grades.gradingScales.default}
    }
    else{
    delete temp.gradingScales[course.name+course.period+course.teacher.name]
    }

    if(allClasses){
    const result = await setSettings(client.district,client.username,client.encrypted,client.password,temp.gradingScales)
    if(result.status){
        console.log("success")
       
    setLetterScale(grades.gradingScales.default.letterScale)
    setGrades(reCalculateAll(temp))
    setShowModal(false)
  }
  else{
    createError("Failed to set settings")
  }
    }
    else{
      setLetterScale(grades.gradingScales.default.letterScale)
    }
}
}





function validate(){
    console.log("spongebob my boy what the fuck is up")
    let temp=structuredClone(letterScale)
    for(var i=0;i<temp.length;i++){
        temp[i][1].sort()

    }

    //consisteny of order
    const raw=temp.map(letter=>letter[1]).flat().sort((a, b) => a - b)
    for(var i=raw.length-1;i>1;i-=2){
        if(temp.findIndex(letter=>letter[1].includes(raw[i]))!=temp.findIndex(letter=>letter[1].includes(raw[i-1]))){
            console.log("failed consitency of order",i,raw,temp.findIndex(letter=>letter[1].includes(raw[i])),temp.findIndex(letter=>letter[1].includes(raw[i-1])))
 
            return false
        }

    }

    //duplicate check
    if(hasDuplicatesSorted(raw)){console.log("failed duplicate check");return false}

 

    return true;
}

//helper function, most efficient
function hasDuplicatesSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) return true;
  }
  return false;
}







return(
<div>
{letterScale!=undefined ? (
<Modal 
show={showModal}
onClose={()=>setShowModal(false)}
>

<Modal.Header
className="dark:bg-gray-700"

>

<h1 className="text-2xl">Grade Calculation Settings <span style={{textOverflow:"ellipsis"}}  className="text-sm">{course.name}</span></h1>
{index==-1 && <p className="text-sm">Changes here will be the default for all your classes!</p>}
</Modal.Header>


<Modal.Body
className="w-full"
>
  <h1 className="mb-4 text-xl font-bold text-white">Letter Scale</h1>

  <div className="w-full flex justify-center overflow-x-auto rounded-lg border border-gray-600">
    <table className="flex-1 mx-auto min-w-max text-left">
      {/* ── header ─────────────────────────────────────────── */}
      <thead>
        <tr className="text-white md:text-xl dark:bg-slate-700">
          <th className="px-4 py-2 font-semibold text-black dark:text-white">Letter</th>
          <th className="px-4 py-2 font-semibold text-black dark:text-white">Lower</th>
          <th className="px-4 py-2 font-semibold text-black dark:text-white">Upper</th>
          {/* empty heading to keep the delete column aligned */}
          <th className="px-4 py-2" />
        </tr>
      </thead>

      {/* ── body ───────────────────────────────────────────── */}
      <tbody>
        {letterScale.map((letter,i) => (
          <tr
            key={`${i}--23`}
            className={i % 2 === 0 ? "bg-neutral-100 dark:bg-gray-900" : "dark:bg-gray-800"}
          >
            {/* letter cell */}
            <td className="px-4 py-2">
              <div style={{alignItems:"center"}} className="flex">
              <input 
              type="text"
               key={`${i}-0`}
              value ={active[0]==`${i}-0` ? active[1] : letter[0]}
              onChange={(e)=>{
                    setActive([`${i}-0`,e.target.value])



              }}    


              onBlur={
                (e)=>{
                    setActive(['',''])
                    mutate(e,i,0)}
              }
              style={{borderWidth:0,textOverflow:"ellipsis"}}
              className="w-12 text-center font-bold bg-transparent dark:text-white md:text-lg  ">
                
              </input>
              <input
              className="w-6 bg-transparent"
              type="color"
              key={`${i}-0.5`}
              value={active[0]==`${i}-0.5` ? active[1] : (letter[2] || colorShit[letterGradeColor(letter[0])])}
                    onChange={(e)=>{
                    setActive([`${i}-0.5`,e.target.value])



              }}    

              onBlur={(e)=>{
                setActive(['',''])
                mutate(e,i,2)
              }}
              >
              
              </input>
              </div>
            </td>

            {/* upper‑bound input */}
            <td className="px-4 py-2">
              <input
                type="number"
                key={`${i}-1`}
                value={   active[0]==`${i}-1` ? active[1] : letter[1][0]}
                onBlur={(e) => {
                               setActive(['',''])
                  mutate2(e,i,0)
                }}

                 onChange={(e)=>{
                        setActive([`${i}-1`,e.target.value])



              }}    
                className="
                  w-16 md:w-24
                  rounded-lg
                  bg-transparent
                  p-1.5
                  font-bold
                  dark:text-white
                  text-right
                  outline-none
                  border border-gray-300  focus:ring-primary-600 focus:border-primary-600   dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500
                "
              />
            </td>

            {/* lower‑bound input */}
            <td className="px-4 py-2">
              <input
                type="number"
                value={   active[0]==`${i}-2` ? active[1] : letter[1][1]}
                 key={`${i}-2`}
                onBlur={(e) => {
                               setActive(['',''])
                    mutate2(e,i,1)
                }}

                 onChange={(e)=>{
                        setActive([`${i}-2`,e.target.value])



              }}    
                className="
                  w-16 md:w-24
                  rounded-lg
                  bg-transparent
                  p-1.5
                  font-bold
                  dark:text-white
                  text-right
                  outline-none
                  border border-gray-300  focus:ring-primary-600 focus:border-primary-600   dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500
                "
              />
            </td>

            {/* delete button */}
            <td className="px-4 py-2">
              <button
                onClick={() => {
                  deleteLetter(i)
                }}
                className="
                  flex items-center gap-1
                  rounded-lg bg-primary-500
                  px-2.5 py-2.5
                  text-xs font-medium text-white
                  hover:bg-primary-600
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                "
              >
                <HiOutlineTrash size="1.2rem" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
 <div className="flex   mt-2 justify-between">
    <button className="p-2 px-2 md:text-base bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={addLetter}>Add+</button>
      <button
        type="button"
        className="text-white md:p-2 md:text-base bg-primary-600 hover:bg-primary-800 active:bg-primary-500 px-3 py-1 rounded-lg text-sm"
        style={{}}
        onClick={()=>{reset()}}
      >
        {index==-1 ? "Show Defaults" : "Show Defaults"} 
      </button>

      </div> 
{/*
    <h1 className="text-xl text-white font-bold mt-10">Rounding Rules</h1>

    <div className="border rounded-lg border-gray-600 flex flex-col gap-4 bg-gray-800">
        <div style={{alignItems:"center"}} className="mx-2 flex gap-2">
        <input
        checked={rounding}
        onChange={()=>setRounding(!rounding)}
        type="checkbox"
        />
        <p className="text-white">Rounding on?</p>
        </div>
        <div>
        <p className="text-white mx-2">Decimal Places</p>
         <input type="number" className="bg-transparent max-w-fit mb-2 mx-2 rounded-lg text-gray-300" value={decimalPlaces} onChange={(e)=>setDecimalPlaces(parseInt(e.target.value))}></input>
         </div>
    </div>

    */}
</Modal.Body>



<Modal.Footer>
<div className="-ml-2 w-full flex justify-start gap-5">
      <button 
      className="text-white text-sm md:text-base hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 bg-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 p-2 px-3 rounded-lg"
      onClick={()=>{saveNew();}}
      
      >
        Save
      </button>

     <button className="text-white  md:text-base bg-gray-500 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900 p-2 px-3 rounded-lg text-sm"
      type="button"
      style={{userSelect:"none"}}
      onClick={()=>{
//not yet cuz the structure doesn't match yet, but, setLetterGrade(course.gradingScale)
        setShowModal(false)

      }}
      >Cancel</button>


    

      {index ==-1 &&
          <button
        type="button"
        className="ml-auto -mr-2  md:text-base text-white bg-primary-600 hover:bg-primary-800 active:bg-primary-500 px-2  rounded-lg text-sm"
        style={{}}
        onClick={()=>{reset(true);setShowModal(false)}}
      >
        Reset Classes
      </button>


      }



</div>


</Modal.Footer>


</Modal>)
: <></>}



</div>


)

}