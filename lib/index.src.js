import React from 'react'
import DraggableResizableBox from './draggable-resizable-box'
import toBlob from 'data-uri-to-blob'

export default React.createClass({
  displayName: 'Cropper',

  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    center: React.PropTypes.bool,
    image: React.PropTypes.any,
    widthLabel: React.PropTypes.string,
    heightLabel: React.PropTypes.string,
    offsetXLabel: React.PropTypes.string,
    offsetYLabel: React.PropTypes.string,
    onImageLoaded: React.PropTypes.func
  },

  getDefaultProps () {
    return {
      center: false,
      width: 'Width',
      height: 'Height',
      offsetXLabel: 'Offset X',
      offsetYLabel: 'Offset Y'
    }
  },

  getInitialState () {
    return {
      imageLoaded: false,
      width: this.props.width,
      height: this.props.height
    }
  },

  shouldComponentUpdate (nextProps, nextState) {
    let {image} = this.props
    return nextProps.image.size !== image.size ||
        nextProps.image.name !== image.name ||
        nextProps.image.type !== image.type ||
        nextState.imageLoaded !== this.state.imageLoaded
  },

  onLoad (evt) {
    let box = React.findDOMNode(this).getBoundingClientRect()
    this.setState({
      imageLoaded: true,
      width: box.width,
      height: box.height
    }, () => {
      let img = React.findDOMNode(this.refs.image)
      this.props.onImageLoaded && this.props.onImageLoaded(img)
    })
  },

  cropImage () {
    let canvas = React.findDOMNode(this.refs.canvas)
    let img = React.findDOMNode(this.refs.image)
    let ctx = canvas.getContext('2d')
    let [xScale, yScale] = [img.naturalWidth / this.state.width,
                            img.naturalHeight / this.state.height]

    let imageOffsetX = xScale < 1 ? 0 : this.state.offset.left * xScale
    let imageOffsetY = yScale < 1 ? 0 : this.state.offset.top * yScale
    let imageWidth = xScale < 1 ? img.naturalWidth : this.state.dimensions.width * xScale
    let imageHeight = yScale < 1 ? img.naturalHeight : this.state.dimensions.height * yScale

    let canvasOffsetX = xScale < 1 ? Math.floor((this.state.dimensions.width - img.naturalWidth) / 2) : 0
    let canvasOffsetY = yScale < 1 ? Math.floor((this.state.dimensions.height - img.naturalHeight) / 2) : 0
    let canvasWidth = xScale < 1 ? img.naturalWidth : this.props.width
    let canvasHeight = yScale < 1 ? img.naturalHeight : this.props.height

    ctx.clearRect(0, 0, this.props.width, this.props.height)
    ctx.drawImage(img, imageOffsetX, imageOffsetY, imageWidth, imageHeight, canvasOffsetX, canvasOffsetY, canvasWidth, canvasHeight)
    return toBlob(canvas.toDataURL())
  },

  onChange (offset, dimensions) {
    this.setState({offset, dimensions})
  },

  render () {
    const url = window.URL.createObjectURL(this.props.image)
    return (
      <div
        className='Cropper'
        style={{
          minWidth: this.props.width,
          minHeight: this.props.height
        }}>
        <canvas
          className='Cropper-canvas'
          ref='canvas'
          width={this.props.width}
          height={this.props.height}>
        </canvas>
        <img
          ref='image'
          src={url}
          className='Cropper-image'
          onLoad={this.onLoad}
          style={{top: this.state.height / 2}}/>
        {this.state.imageLoaded &&
          <div className='box'>
            <DraggableResizableBox
              aspectRatio={this.props.width / this.props.height}
              width={this.state.width}
              height={this.state.height}
              minConstraints={[this.props.width, this.props.height]}
              onChange={this.onChange}
              widthLabel={this.props.widthLabel}
              heightLabel={this.props.heightLabel}
              offsetXLabel={this.props.offsetXLabel}
              offsetYLabel={this.props.offsetYLabel}>
                <div className='Cropper-box'></div>
            </DraggableResizableBox>
          </div>}
      </div>
    )
  }
})
