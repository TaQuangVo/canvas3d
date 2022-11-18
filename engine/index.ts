import {pointTimeMatrix, translateTriangle, rotateTriangle, getNormal, dotProduct, normalize} from "./utils"

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

const meshCube:mesh = {
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

const buildProjectionMatrix = (a:number, near:number, far:number, fov:number):number[][]=>{
    const f = 1/Math.tan(fov*0.5/180*Math.PI)
    const q = far/(far-near)
    return [
        [a*f, 0, 0, 0],
        [0, f, 0, 0],
        [0, 0, q, 1],
        [0, 0, -near*q, 0]
    ]
}
export default class Engin {
    private ctx:CanvasRenderingContext2D
    private mesh:mesh
    private animationIndex:null|number
    private near:number
    private far:number
    private fov:number
    private aspectRatio:number
    private camera:point
    private lightDir:point
    private projectionMatrix:number[][]

    constructor(ctx:CanvasRenderingContext2D){
        this.ctx = ctx
        this.mesh = meshCube
        this.animationIndex=null
        this.near = 1
        this.far = 1000
        this.fov = 90
        this.aspectRatio = ctx.canvas.height / ctx.canvas.width
        this.projectionMatrix = buildProjectionMatrix(this.aspectRatio, this.near, this.far, this.fov)
        this.camera = {x:0, y:0, z:0}
        this.lightDir = {x:0, y:0, z:-1}
    }
    projectTriangle(tri:triangle):triangle{
        const projTri:triangle = {points:[
            pointTimeMatrix(tri.points[0],this.projectionMatrix),
            pointTimeMatrix(tri.points[1],this.projectionMatrix),
            pointTimeMatrix(tri.points[2],this.projectionMatrix)
        ]}
        return projTri
    }
    update(timestamp:number){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.mesh.tris.forEach(triangle => {
            const rotaTri = rotateTriangle(triangle,timestamp/3000,timestamp/1000,timestamp/2000)
            const tranTri = translateTriangle(rotaTri,0,0,3)
            const triNormal = getNormal(tranTri)
            const lookAt = {x:tranTri.points[0].x-this.camera.x, y:tranTri.points[0].y-this.camera.y, z: tranTri.points[0].z-this.camera.z}
            if(dotProduct(lookAt,triNormal) < 0){
                const projTri = this.projectTriangle(tranTri)
                const viewTri = this.scaleToView(projTri)
                const shading = dotProduct(normalize(this.lightDir), triNormal)
                this.fillTriangle(viewTri, shading)
                //this.drawTriangle(viewTri)
            }
        })
        this.animationIndex = requestAnimationFrame(this.update.bind(this))
    }
    private scaleToView(tri:triangle):triangle{
        return {points:[{
            x:(tri.points[0].x+1)*0.5*this.ctx.canvas.width, y:(tri.points[0].y+1)*0.5*this.ctx.canvas.height, z:tri.points[0].z},
            {x:(tri.points[1].x+1)*0.5*this.ctx.canvas.width, y:(tri.points[1].y+1)*0.5*this.ctx.canvas.height, z:tri.points[0].z},
            {x:(tri.points[2].x+1)*0.5*this.ctx.canvas.width, y:(tri.points[2].y+1)*0.5*this.ctx.canvas.height, z:tri.points[0].z}]}
    }
    cancelAnimation(){
        if(this.animationIndex)
            cancelAnimationFrame(this.animationIndex)
    }
    private fillTriangle(triCoord:triangle, shading:number){
        this.ctx.beginPath()
        this.ctx.moveTo(triCoord.points[0].x, triCoord.points[0].y)
        this.ctx.lineTo(triCoord.points[1].x, triCoord.points[1].y)
        this.ctx.lineTo(triCoord.points[2].x, triCoord.points[2].y)
        this.ctx.lineTo(triCoord.points[0].x, triCoord.points[0].y)
        this.ctx.lineWidth = 1
        this.ctx.fillStyle = `rgb(${shading*225},${shading*225},${shading*225})`
        this.ctx.fill()
    }
    private drawTriangle(triCoord:triangle){
        this.ctx.beginPath()
        this.ctx.moveTo(triCoord.points[0].x, triCoord.points[0].y)
        this.ctx.lineTo(triCoord.points[1].x, triCoord.points[1].y)
        this.ctx.lineTo(triCoord.points[2].x, triCoord.points[2].y)
        this.ctx.lineTo(triCoord.points[0].x, triCoord.points[0].y)
        this.ctx.lineWidth = 1
        this.ctx.stroke()
    }
}