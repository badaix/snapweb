iOS 8 App Icon SVG Template for Inkscape
===

Originally downloaded from [Kodira](http://kodira.de/2013/11/ios-7-app-icon-template-inkscape-svg-editor/) and modified for use with the new iOS 8 specifications and Mac OS X platform.

Summary
---

> There are a couple of IOS 7 App Icon Template for Photoshop available, but none
> for Inkscape. We here at Kodira are fond of [Inkscape](http://www.inkscape.org) a great vector graphics
> editor to edit SVG files. So we created our own SVG App Icon Template for iPad
> and iPhone 7 Apps. It includes the new golden ratio grid. For easy export we
> wrote a small script to quickly render your App icon in all [sizes you will need
> for iOS development](https://developer.apple.com/library/ios/documentation/userexperience/conceptual/mobilehig/IconMatrix.html). You can download the SVG template and the script here.
> 
> - _Kodira_

How to use
---

Download these files. There are two files:

+ AppIconTemplate.svg
+ resize.sh

### Design Instructions

1. Open `AppIconTemplate` in Inkscape.
2. Design icon on `Layer`.
3. Color `Background`.
4. Hide `GUIDES`, `MASK`, and `BORDER`.
5. Save and run script.

If you want a precomposed icon with the rounded corners:

1. Follow same steps as above.
2. Before saving show `FULL MASK to BG`.
3. Select white mask and background.
4. Set Mask. (Should now look the same as when `MASK` is shown.)
5. Save and run scipt.

### Script Instructions

You may need to edit the path to your Inkscape binary for this to work.

```sh
./resize.sh AppIconTemplate.svg
```

