import {
  connect,
} from 'react-redux';

import {
  Avatar, Tooltip, Link,
} from '@chakra-ui/react';

// import {
//   getInitials,
// } from 'util/helpers';

const PersonInitialsComponent = ({
  users, displayedUsers,
}) => {
  const {
    usersMap,
  } = users;
  const displayedUsersByInitials = displayedUsers.length > 0
    ? displayedUsers.map(({
      user,
    }) => {
      let color;
      if (usersMap[user.id]) {
        color = usersMap[user.id].color.replace('-', '');
      } else {
        color = 'black';
      }
      return {
        summary: user.summary,
        // initials: getInitials(user.summary),
        id: user.id,
        html_url: user.html_url,
        color: CSS.supports('color', color) ? color : 'black',
      };
    })
    : [];

  return (
    <div>
      {displayedUsersByInitials.map((user) => (
        <Tooltip key={user.id} label={user.summary} aria-label={user.summary}>
          <Link isExternal href={user.html_url}>
            <Avatar
              color="white"
              mr={1}
              whiteSpace="nowrap"
              overflow="hidden"
              name={user.summary}
              href={user.html_url}
              size="sm"
              bg={user.color}
              getInitials={(name) => {
                const allNames = name.trim().split(' ');
                const firstInitial = allNames[0].match(/./u);
                const lastInitial = allNames[allNames.length - 1].match(/./u);
                return `${firstInitial}${lastInitial}`;
              }}
            />
          </Link>
        </Tooltip>
      ))}
    </div>
  );
};

const mapStateToProps = (state) => ({
  users: state.users,
});

export default connect(mapStateToProps)(PersonInitialsComponent);
