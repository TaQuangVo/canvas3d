import {vector3d, vector_normalize, vector_multiplyMatrix} from "./matrix"
export interface face{
    vertices: [vector3d, vector3d, vector3d],
    shade?: number
}
export interface mesh{
    faces: Array<face>
}
export function face_applyMatrix(f:face, m:number[][]):face{
    return{
        vertices:[
            vector_multiplyMatrix(f.vertices[0], m),
            vector_multiplyMatrix(f.vertices[1], m),
            vector_multiplyMatrix(f.vertices[2], m)
        ]
    }
}
export function face_getNormal(tri:face):vector3d{
    const v1:vector3d = {
        x:tri.vertices[1].x-tri.vertices[0].x,
        y:tri.vertices[1].y-tri.vertices[0].y,
        z:tri.vertices[1].z-tri.vertices[0].z
    }
    const v2:vector3d = {
        x:tri.vertices[2].x-tri.vertices[0].x,
        y:tri.vertices[2].y-tri.vertices[0].y,
        z:tri.vertices[2].z-tri.vertices[0].z
    }
    let vNormal:vector3d = {
        x: v1.y*v2.z - v1.z*v2.y, 
        y: v1.z*v2.x - v1.x*v2.z, 
        z: v1.x*v2.y - v1.y*v2.x, 
    }
    return vector_normalize(vNormal)
}

export async function objLoader(url:string):Promise< mesh|null>{
    const data = await fetch(url)
    if(data.status != 200){
        console.log("Cannot load file")
        return null
    }
    if(!data.body){
        console.log("No data")
        return null
    }
    const reader = data.body.getReader()
    let content:string = ""
    let end:boolean
    do{
        const {done, value} = await reader.read()
        const strValue = new TextDecoder("utf-8").decode(value)
        content += strValue
        end = done
    }while(end)

    const lines = content.split("\n")
    const vertices:vector3d[] = []
    let mesh:mesh = {
        faces:[]
    }
    for(let i = 0; i < lines.length; i++){
        if(lines[i][0] === 'v'){
            const vs = lines[i].split(" ")
            const vertex:vector3d = {
                x:parseFloat(vs[1]),
                y:parseFloat(vs[2]),
                z:parseFloat(vs[3])}
            
            vertices.push(vertex)
        }
        if(lines[i][0] === 'f'){
            const fs = lines[i].split(" ")
            const p1 = parseInt(fs[1])-1
            const p2 = parseInt(fs[2])-1
            const p3 = parseInt(fs[3])-1
            const triangle:face = {
                vertices:[
                    vertices[p1],
                    vertices[p2],
                    vertices[p3]
                ]
            } 
            mesh.faces.push(triangle)
        }
    }
    return mesh
}
export function meshCube():mesh{
    return {
        faces:[
            {vertices:[{x:-0.5,y:-0.5,z:-0.5},{x:-0.5,y:0.5,z:-0.5},{x:0.5,y:0.5,z:-0.5}]},
            {vertices:[{x:-0.5,y:-0.5,z:-0.5},{x:0.5,y:0.5,z:-0.5},{x:0.5,y:-0.5,z:-0.5}]},
    
            {vertices:[{x:0.5,y:-0.5,z:-0.5},{x:0.5,y:0.5,z:-0.5},{x:0.5,y:0.5,z:0.5}]},
            {vertices:[{x:0.5,y:-0.5,z:-0.5},{x:0.5,y:0.5,z:0.5},{x:0.5,y:-0.5,z:0.5}]},
    
            {vertices:[{x:0.5,y:-0.5,z:0.5},{x:0.5,y:0.5,z:0.5},{x:-0.5,y:0.5,z:0.5}]},
            {vertices:[{x:0.5,y:-0.5,z:0.5},{x:-0.5,y:0.5,z:0.5},{x:-0.5,y:-0.5,z:0.5}]},
    
            {vertices:[{x:-0.5,y:-0.5,z:0.5},{x:-0.5,y:0.5,z:0.5},{x:-0.5,y:0.5,z:-0.5}]},
            {vertices:[{x:-0.5,y:-0.5,z:0.5},{x:-0.5,y:0.5,z:-0.5},{x:-0.5,y:-0.5,z:-0.5}]},
    
            {vertices:[{x:-0.5,y:0.5,z:-0.5},{x:-0.5,y:0.5,z:0.5},{x:0.5,y:0.5,z:0.5}]},
            {vertices:[{x:-0.5,y:0.5,z:-0.5},{x:0.5,y:0.5,z:0.5},{x:0.5,y:0.5,z:-0.5}]},
    
            {vertices:[{x:0.5,y:-0.5,z:0.5},{x:-0.5,y:-0.5,z:0.5},{x:-0.5,y:-0.5,z:-0.5}]},
            {vertices:[{x:0.5,y:-0.5,z:0.5},{x:-0.5,y:-0.5,z:-0.5},{x:0.5,y:-0.5,z:-0.5}]},
        ]
    }
}
//sorting triangles
export function getAvgZ(tri:face):number{
    let avg = tri.vertices[0].z+tri.vertices[1].z+tri.vertices[2].z;
    return avg/3
}
function swap(tris:face[], i:number, j:number){
    const temp = tris[j]
    tris[j] = tris[i]
    tris[i] = temp
}
function quickshort(tris:face[], start:number, end:number){
    if(end - start <= 0)
        return

    const pivotZ = getAvgZ(tris[end])
    let j = start-1
    for(let i = start; i< end; i++)
        if(getAvgZ(tris[i]) > pivotZ)
            swap(tris, ++j, i)
    swap(tris, ++j, end)
    
    quickshort(tris, start, j-1)
    quickshort(tris, j+1, end)
}
export function sortTriangle(tris:face[]){
    if(tris.length < 2)
        return
    quickshort(tris, 0, tris.length-1)
}