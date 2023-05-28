import {
  connect,
} from 'react-redux';

import {
  Avatar,
  Tooltip,
  Link,
} from '@chakra-ui/react';

// import {
//   OverlayTrigger, Tooltip,
// } from 'react-bootstrap';

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
        <Tooltip
          key={user.id}
          label={user.summary}
          aria-label={user.summary}
        >
          <Link isExternal href={user.html_url}>
            <Avatar
              color="white"
              mr={1}
              name={user.summary}
              href={user.html_url}
              size="sm"
              bg={user.color}
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
