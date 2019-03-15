import * as React from 'react'
import { Screen, Images, Theme, OnboardingContent, OnboardingSwiperSlide, Slide, NavBar } from '@kancha'
import { Navigator, NavigatorStyle } from 'react-native-navigation'
import Swiper from 'react-native-swiper'

const onboardingSlides: OnboardingSwiperSlide[] = OnboardingContent(Images)

interface LearnProps {
  navigator: Navigator
}

const Learn: React.FC<LearnProps> & { navigatorStyle: NavigatorStyle } = props => {
  return (
    <Screen
      type={Screen.Types.Custom}
      config={Screen.Config.SafeNoScroll}
      backgroundImage={Images.backgrounds.purpleGradientHalve}
    >
      <Swiper loop={false} bounces activeDotColor={Theme.colors.primary.brand} paginationStyle={{ marginBottom: 30 }}>
        {onboardingSlides.map((slide: OnboardingSwiperSlide) => {
          return <Slide key={slide.key} title={slide.title} content={slide.content} image={slide.image} />
        })}
      </Swiper>
      <NavBar
        leftButtonAction={() => props.navigator.pop()}
        rightButtonAction={() => props.navigator.push({ screen: 'onboarding2.AddName' })}
        rightButttonText={'Skip'}
      />
    </Screen>
  )
}

Learn.navigatorStyle = {
  navBarHidden: true,
}

export default Learn
