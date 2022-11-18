export interface point{
    x:number,
    y:number,
    z:number
}
export interface triangle{
    points: [point, point, point],
    shade?: number
}
export interface mesh{
    tris: Array<triangle>
}

function multiplyMatrices(m1:number[][], m2:number[][]):number[][] {
    var result:number[][] = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}
function pointToMatrix(point:point):number[][]{
    return [[point.x, point.y, point.z]]
}
function matrixToPoint(number:number[][]):point{
    return {x:number[0][0],y:number[0][1],z:number[0][2]}
}
function inhancePointToMatrix(point:point):number[][] {
    return [[point.x, point.y, point.z, 1]]
}
export function pointTimeMatrix(point:point, matrix:number[][]):point{
    const pointMat = inhancePointToMatrix(point)
    const mul = multiplyMatrices(pointMat, matrix)
    
    let ret;
    if(mul[0][3] != 0)
        ret = [[mul[0][0]/mul[0][3], mul[0][1]/mul[0][3], mul[0][2]]]
    else
        ret = [[mul[0][0], mul[0][1], mul[0][2]]]
    return matrixToPoint(ret)
}
export function translateTriangle(tri:triangle, x:number, y:number, z:number):triangle{
    return {points:[
        {x:(tri.points[0].x+x), y:(tri.points[0].y+y), z:tri.points[0].z+z},
        {x:(tri.points[1].x+x), y:(tri.points[1].y+y), z:tri.points[1].z+z},
        {x:(tri.points[2].x+x), y:(tri.points[2].y+y), z:tri.points[2].z+z}]}
}
export function rotateTriangle(tri: triangle, x:number, y:number, z:number):triangle{
    const zRMatrix = [
        [Math.cos(z), -Math.sin(z), 0],
        [Math.sin(z), Math.cos(z), 0],
        [0,0,1]
    ]
    const xRMatrix = [
        [1, 0, 0],
        [0, Math.cos(x), -Math.sin(x)],
        [0,Math.sin(x),Math.cos(x)]
    ]
    const yRMatrix = [
        [Math.cos(y), 0, Math.sin(y)],
        [0, 1, 0],
        [-Math.sin(y),0,Math.cos(y)]
    ]
    let triMatrix= pointToMatrix(tri.points[0])
    let triMatrix1 = pointToMatrix(tri.points[1])
    let triMatrix2 = pointToMatrix(tri.points[2])
    
    triMatrix = multiplyMatrices(triMatrix, zRMatrix)
    triMatrix1 = multiplyMatrices(triMatrix1, zRMatrix)
    triMatrix2 = multiplyMatrices(triMatrix2, zRMatrix)

    triMatrix = multiplyMatrices(triMatrix, xRMatrix)
    triMatrix1 = multiplyMatrices(triMatrix1, xRMatrix)
    triMatrix2 = multiplyMatrices(triMatrix2, xRMatrix)

    triMatrix = multiplyMatrices(triMatrix, yRMatrix)
    triMatrix1 = multiplyMatrices(triMatrix1, yRMatrix)
    triMatrix2 = multiplyMatrices(triMatrix2, yRMatrix)

    return {points:[
        matrixToPoint(triMatrix),
        matrixToPoint(triMatrix1),
        matrixToPoint(triMatrix2)
    ]}
}
export function getNormal(tri:triangle):point{
    const v1:point = {
        x:tri.points[1].x-tri.points[0].x,
        y:tri.points[1].y-tri.points[0].y,
        z:tri.points[1].z-tri.points[0].z
    }
    const v2:point = {
        x:tri.points[2].x-tri.points[0].x,
        y:tri.points[2].y-tri.points[0].y,
        z:tri.points[2].z-tri.points[0].z
    }
    let vNormal:point = {
        x: v1.y*v2.z - v1.z*v2.y, 
        y: v1.z*v2.x - v1.x*v2.z, 
        z: v1.x*v2.y - v1.y*v2.x, 
    }

    return normalize(vNormal)
}
export function dotProduct(v1:point, v2:point):number{
    return v1.x*v2.x+ v1.y*v2.y + v1.z*v2.z
}
export function normalize(v:point):point{
    const l:number = Math.sqrt(
        Math.pow(v.x,2)+
        Math.pow(v.y, 2)+
        Math.pow(v.z,2))
    return{
    x:v.x / l,
    y:v.y / l,
    z:v.z / l
    }
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
    const vertices:point[] = []
    let mesh:mesh = {
        tris:[]
    }
    for(let i = 0; i < lines.length; i++){
        if(lines[i][0] === 'v'){
            const vs = lines[i].split(" ")
            const vertex:point = {
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
            const triangle:triangle = {
                points:[
                    vertices[p1],
                    vertices[p2],
                    vertices[p3]
                ]
            } 
            mesh.tris.push(triangle)
        }
    }
    return mesh
}
export function meshCube():mesh{
    return {
        tris:[
            {points:[{x:-0.5,y:-0.5,z:-0.5},{x:-0.5,y:0.5,z:-0.5},{x:0.5,y:0.5,z:-0.5}]},
            {points:[{x:-0.5,y:-0.5,z:-0.5},{x:0.5,y:0.5,z:-0.5},{x:0.5,y:-0.5,z:-0.5}]},
    
            {points:[{x:0.5,y:-0.5,z:-0.5},{x:0.5,y:0.5,z:-0.5},{x:0.5,y:0.5,z:0.5}]},
            {points:[{x:0.5,y:-0.5,z:-0.5},{x:0.5,y:0.5,z:0.5},{x:0.5,y:-0.5,z:0.5}]},
    
            {points:[{x:0.5,y:-0.5,z:0.5},{x:0.5,y:0.5,z:0.5},{x:-0.5,y:0.5,z:0.5}]},
            {points:[{x:0.5,y:-0.5,z:0.5},{x:-0.5,y:0.5,z:0.5},{x:-0.5,y:-0.5,z:0.5}]},
    
            {points:[{x:-0.5,y:-0.5,z:0.5},{x:-0.5,y:0.5,z:0.5},{x:-0.5,y:0.5,z:-0.5}]},
            {points:[{x:-0.5,y:-0.5,z:0.5},{x:-0.5,y:0.5,z:-0.5},{x:-0.5,y:-0.5,z:-0.5}]},
    
            {points:[{x:-0.5,y:0.5,z:-0.5},{x:-0.5,y:0.5,z:0.5},{x:0.5,y:0.5,z:0.5}]},
            {points:[{x:-0.5,y:0.5,z:-0.5},{x:0.5,y:0.5,z:0.5},{x:0.5,y:0.5,z:-0.5}]},
    
            {points:[{x:0.5,y:-0.5,z:0.5},{x:-0.5,y:-0.5,z:0.5},{x:-0.5,y:-0.5,z:-0.5}]},
            {points:[{x:0.5,y:-0.5,z:0.5},{x:-0.5,y:-0.5,z:-0.5},{x:0.5,y:-0.5,z:-0.5}]},
        ]
    }
}

export const buildProjectionMatrix = (a:number, near:number, far:number, fov:number):number[][]=>{
    const f = 1/Math.tan(fov*0.5/180*Math.PI)
    const q = far/(far-near)
    return [
        [a*f, 0, 0, 0],
        [0, f, 0, 0],
        [0, 0, q, 1],
        [0, 0, -near*q, 0]
    ]
}
export function getAvgZ(tri:triangle):number{
    let avg = tri.points[0].z+tri.points[1].z+tri.points[2].z;
    return avg/3
}
function swap(tris:triangle[], i:number, j:number){
    const temp = tris[j]
    tris[j] = tris[i]
    tris[i] = temp
}
function quickshort(tris:triangle[], start:number, end:number){
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
export function sortTriangle(tris:triangle[]){
    if(tris.length < 2)
        return
    quickshort(tris, 0, tris.length-1)
}