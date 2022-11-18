import {point, triangle} from "./index"

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
        ret = [[mul[0][0]/mul[0][3], mul[0][1]/mul[0][3], mul[0][2]/mul[0][3]]]
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