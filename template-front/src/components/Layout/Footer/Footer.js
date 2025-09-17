import React from 'react'
import { CONSTANT } from '../../../utils/constant'

function Footer({ isIconOnly }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${isIconOnly ? 'icon-only' : ''}`}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">
              © {currentYear} 
          </div>
          <div className="col-sm-6">
            <div className="text-sm-end d-none d-sm-block">
              {CONSTANT.AUTH.APP_NAME} - All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
