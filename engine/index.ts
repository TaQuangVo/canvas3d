import {
    vector3d,
    make_projectionMatrix,
    make_rotationMatrixY,
    make_rotationMatrixX,
    make_translationMatrix,
    matrix_mul,
    vector_dot,
    vector_sub
} from "./matrix"
import {
    face_applyMatrix,
    face_getNormal,
    sortTriangle,
    meshCube,
    objLoader,
    face,
    mesh
} from "./utils"

export default class Engin {
    private ctx:CanvasRenderingContext2D
    private mesh:mesh
    private animationIndex:null|number
    private near:number
    private far:number
    private fov:number
    private aspectRatio:number
    private camera:vector3d
    private lightDir:vector3d
    private projectionMatrix:number[][]

    constructor(ctx:CanvasRenderingContext2D){
        this.ctx = ctx
        this.mesh = meshCube()
        this.animationIndex=null
        this.near = 1
        this.far = 1000
        this.fov = 90
        this.aspectRatio = ctx.canvas.height / ctx.canvas.width
        this.projectionMatrix = make_projectionMatrix(this.aspectRatio, this.near, this.far, this.fov)
        this.camera = {x:0, y:0, z:0}
        this.lightDir = {x:0, y:0, z:-1}
        
        objLoader("teapot.obj").then((result)=>{
            if(result != null)
                this.mesh = result
        })
    }
    update(timestamp:number){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let buffer:face[] =[] 
        this.mesh.faces.forEach(face => {
            //rotation the object aroud the origin
            const rotateMatX = make_rotationMatrixX(Math.PI)
            const rotateMatY = make_rotationMatrixY(timestamp/1000)
            const rotateMat = matrix_mul(rotateMatX, rotateMatY)
            face = face_applyMatrix(face, rotateMat)
            //tranform the object from the origin
            const transformMat = make_translationMatrix(0,2,5)
            face = face_applyMatrix(face, transformMat)
            //calc triangle that face away and do not render
            const normal = face_getNormal(face)
            const lookAt:vector3d = vector_sub(face.vertices[0],this.camera)
            const faceToCamera = vector_dot(normal, lookAt)
            if(faceToCamera < 0){
                //projection
                face = face_applyMatrix(face, this.projectionMatrix)
                //scale into viewport
                face = this.scaleToView(face)
                //calc shading
                const shade = vector_dot(this.lightDir,normal)
                face.shade = shade
                buffer.push(face)
            }
        })
        //sort faces after it z-index
        sortTriangle(buffer)
        buffer.forEach(face=>{
            this.drawTriangle(face, false)
        })
        this.animationIndex = requestAnimationFrame(this.update.bind(this))
    }
    private scaleToView(tri:face):face{
        return {vertices:[
            {x:(tri.vertices[0].x+1)*0.5*this.ctx.canvas.width, y:(tri.vertices[0].y+1)*0.5*this.ctx.canvas.height, z:tri.vertices[0].z},
            {x:(tri.vertices[1].x+1)*0.5*this.ctx.canvas.width, y:(tri.vertices[1].y+1)*0.5*this.ctx.canvas.height, z:tri.vertices[0].z},
            {x:(tri.vertices[2].x+1)*0.5*this.ctx.canvas.width, y:(tri.vertices[2].y+1)*0.5*this.ctx.canvas.height, z:tri.vertices[0].z}]}
    }
    cancelAnimation(){
        if(this.animationIndex)
            cancelAnimationFrame(this.animationIndex)
    }
    private drawTriangle(tri:face, stroke:boolean){
        this.ctx.beginPath()
        this.ctx.moveTo(tri.vertices[0].x, tri.vertices[0].y)
        this.ctx.lineTo(tri.vertices[1].x, tri.vertices[1].y)
        this.ctx.lineTo(tri.vertices[2].x, tri.vertices[2].y)
        this.ctx.closePath()
        this.ctx.lineWidth = 1
        
        if(tri.shade){
            this.ctx.fillStyle = `rgb(${tri.shade*255},${tri.shade*25},${tri.shade*25})`
            this.ctx.strokeStyle = `rgb(${tri.shade*255},${tri.shade*155},${tri.shade*155})`
        }
        if(stroke)
            this.ctx.strokeStyle = `rgb(10,10,10)`
        this.ctx.stroke()
        this.ctx.fill()
    }
}