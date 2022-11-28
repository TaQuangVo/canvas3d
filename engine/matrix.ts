export interface vector3d{
    x:number,
    y:number,
    z:number
}
//functions
export function vector_add(v1:vector3d, v2:vector3d):vector3d{
    return{x:v1.x + v2.x, y:v1.y + v2.y, z:v1.z + v2.z}
}
export function vector_sub(v1:vector3d, v2:vector3d):vector3d{
    return{x:v1.x - v2.x, y:v1.y - v2.y, z:v1.z - v2.z}
}
export function vector_mul(v1:vector3d, k:number):vector3d{
    return{x:v1.x*k, y:v1.y*k, z:v1.z*k}
}
export function vector_div(v1:vector3d, k:number):vector3d{
    if(k == 0) return v1
    return{x:v1.x/k, y:v1.y/k, z:v1.z/k}
}
export function vector_dot(v1:vector3d, v2:vector3d):number{
    return v1.x*v2.x+ v1.y*v2.y + v1.z*v2.z
}
export function vector_len(v1:vector3d):number{
    return Math.sqrt(vector_dot(v1,v1))
}
export function vector_normalize(v:vector3d):vector3d{
    const l = vector_len(v)
    return{ x:v.x/l, y:v.y/l, z:v.z/l}
}
export function vector_cross(v1:vector3d, v2:vector3d):vector3d{
    return {
        x: v1.y*v2.z - v1.z*v2.y, 
        y: v1.z*v2.x - v1.x*v2.z, 
        z: v1.x*v2.y - v1.y*v2.x
    }
}
export function matrix_mul(m1:number[][], m2:number[][]):number[][] {
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
export function vector_toMatrix(point:vector3d):number[][]{
    return [[point.x, point.y, point.z, 1]]
}
export function matrix_toVectorNormalized(number:number[][]):vector3d{
    const w = number[0][3]!=0?number[0][3]:1
    return {x:number[0][0]/w,y:number[0][1]/w,z:number[0][2]}
}
export function vector_multiplyMatrix(v1:vector3d, m:number[][]):vector3d{
    const vectorMatrix = vector_toMatrix(v1)
    return matrix_toVectorNormalized(matrix_mul(vectorMatrix,m))
}
export function make_rotationMatrixZ(angle:number):number[][]{
    return [
        [Math.cos(angle), -Math.sin(angle), 0, 0],
        [Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
}
export function make_rotationMatrixX(angle:number):number[][]{
    return [
        [1, 0, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle), 0],
        [0,Math.sin(angle),Math.cos(angle), 0],
        [0, 0, 0, 1]
    ]
}
export function make_rotationMatrixY(angle:number):number[][]{
    return [
        [Math.cos(angle), 0, Math.sin(angle), 0],
        [0, 1, 0, 0],
        [-Math.sin(angle),0,Math.cos(angle), 0],
        [0, 0, 0, 1]
    ]
}
export function make_identityMatrix(angle:number):number[][]{
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
}
export function make_translationMatrix(x:number, y:number, z:number):number[][]{
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1]
    ]
}
export const make_projectionMatrix = (a:number, near:number, far:number, fov:number):number[][]=>{
    const f = 1/Math.tan(fov*0.5/180*Math.PI)
    const q = far/(far-near)
    return [
        [a*f, 0, 0, 0],
        [0, f, 0, 0],
        [0, 0, q, 1],
        [0, 0, -near*q, 0]
    ]
}